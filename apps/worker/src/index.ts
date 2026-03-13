import { CronJob } from "cron";
import prisma from "@repo/database";
import pLimit from "p-limit";
import type { IMonitor } from "../types";
import transporter from "./transporter";

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
    console.log("sending alert");

    const EMAIL_TEXT = isDown
      ? `
    Hello,
        Your monitor ${monitor.name} is down.
        Please check it.

        last checked at ${lastCheckedAt.toLocaleString()}`
      : `
    Hello,
        Your monitor ${monitor.name} is back to normal.
        Please check it.

        last checked at ${lastCheckedAt.toLocaleString()}`;

    const mailOptions = {
      from: "bettermonitors@gmail.com",
      to: userEmail,
      subject: "Monitor Alert",
      text: EMAIL_TEXT,
    };

    console.log("sending alert to ", userEmail);
    // await transporter.sendMail(mailOptions);
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

            if (monitorStatus === "DOWN" && lastStatus === "UP") {
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
