import { CronJob } from "cron";
import prisma from "@repo/database";
import pLimit from "p-limit";
import type { IMonitor } from "../types";
import resend from "./resend";
import { FROM_EMAIL_ADDRESS } from "./config";

const limit = pLimit(50);

const checkMonitor = (
  monitor: IMonitor,
): Promise<{
  monitorStatus: "UP" | "DOWN";
  latency: number | null;
  statusCode: number | null;
}> => {
  let monitorStatus: "UP" | "DOWN";
  let statusCode: number | null;
  let latency: number | null;
  let startTime = Date.now();

  return new Promise((resolve, reject) => {
    fetch(monitor.url, {
      signal: AbortSignal.timeout(10000),
    })
      .then((res) => {
        statusCode = res.status;
        if (res.ok) {
          monitorStatus = "UP";
          latency = Date.now() - startTime;
          resolve({
            monitorStatus,
            statusCode,
            latency,
          });
        } else {
          monitorStatus = "DOWN";
          resolve({
            monitorStatus,
            statusCode,
            latency: null,
          });
        }
      })
      .catch((error) => {
        monitorStatus = "DOWN";
        resolve({
          monitorStatus,
          statusCode: error.status,
          latency: null,
        });
      });
  });
};

const createTick = async (
  monitorId: string,
  monitorStatus: "UP" | "DOWN",
  statusCode: number | null,
  latency: number | null,
) => {
  try {
    const tick = await prisma.tick.create({
      data: {
        monitorId,
        status: monitorStatus,
        latency: latency ?? null,
        statusCode: statusCode ?? null,
      },
    });
    console.log("tick successfully added", tick);
  } catch (error) {
    console.error(error);
  }
};

const sendAlert = async (
  monitor: IMonitor,
  userEmail: string,
  lastCheckedAt: Date,
  isDown: boolean,
) => {
  try {
    const EMAIL_TEXT = `
    <div style="font-family: Arial, sans-serif; line-height:1.6;">
      <h2>Monitor Status Alert</h2>
    
      <p>Hello,</p>
    
      <p>We detected a status change for one of your monitors.</p>
    
      <p>
        <strong>Monitor Name:</strong> ${monitor.name}<br/>
        <strong>Monitor URL:</strong> ${monitor.url}<br/>
        <strong>Status:</strong> ${isDown ? "Down ❌" : "Operational ✅"}<br/>
        <strong>Last Checked:</strong> ${lastCheckedAt.toLocaleString()}
      </p>
    
      <p>
        ${isDown
        ? "Our monitoring system detected that your service is currently unreachable."
        : "Good news! Your service is responding normally again."
      }
      </p>
    
      <p>If you did not expect this alert, please verify your server or application status.</p>
    
      <p>Best regards,<br/>Monitoring System</p>
    </div>
    `;

    // await resend.emails.send({
    //   from: FROM_EMAIL_ADDRESS,
    //   to: [userEmail],
    //   subject: `Mointor Alert for ${monitor.url}`,
    //   html: EMAIL_TEXT
    // })
  } catch (error) {
    console.error("error sending alert", error);
  }
};

const job = new CronJob(
  "*/3 * * * *",
  async () => {
    try {
      console.log("checking monitors");
      const monitors = await prisma.monitor.findMany({
        where: {
          isActive: "ACTIVE",
        },
        include: {
          ticks: {
            select: {
              status: true,
              checkedAt: true,
            },
            orderBy: {
              checkedAt: "desc",
            },
            take: 1,
          },
          user: {
            select: {
              email: true,
            },
          },
        },
      });

      await Promise.all(
        monitors.map((monitor) =>
          limit(async () => {
            const { monitorStatus, latency, statusCode } =
              await checkMonitor(monitor);

            await createTick(monitor.id, monitorStatus, statusCode, latency);

            const lastStatus = monitor.ticks[0]?.status;

            if (monitorStatus === "DOWN" && (lastStatus === "UP" || !lastStatus)) {
              await sendAlert(monitor, monitor.user.email, new Date(), true);
            }
            if (monitorStatus === "UP" && lastStatus === "DOWN") {
              await sendAlert(monitor, monitor.user.email, new Date(), false);
            }
          }),
        ),
      );
    } catch (error) {
      console.error(error);
    }
  },
  null,
  true,
  "Asia/Kolkata",
);
