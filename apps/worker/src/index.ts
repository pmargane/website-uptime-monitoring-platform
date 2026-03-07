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
    fetch(monitor.url)
      .then((res) => {
        if (res.ok) {
          monitorStatus = "UP";
          statusCode = res.status;
          latency = Date.now() - startTime;
          resolve({
            monitorStatus,
            statusCode,
            latency,
          });
        }
      })
      .catch((error) => {
        monitorStatus = "DOWN";
        resolve({
          monitorStatus,
          statusCode,
          latency,
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
        ...(latency && {
          latency,
        }),
        ...(statusCode && {
          statusCode,
        }),
      },
    });
    console.log("tick successfully added", tick);
  } catch (error) {
    console.error(error);
  }
};

const sendAlert = async (
  monitor: IMonitor,
  lastCheckedAt: Date,
  isDown: boolean,
) => {
  try {
    console.log("sending alert");
    const user = await prisma.user.findUnique({
      where: {
        id: monitor.userId,
      },
    });
    if (!user) {
      throw new Error("User not found");
    }

    const { email } = user;

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
      to: email,
      subject: "Monitor Alert",
      text: EMAIL_TEXT,
    };

    console.log("sending alert to ", email);
    // await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("error sending alert", error);
  }
};

const job = new CronJob(
  "* * * * * *",
  async () => {
    try {
      console.log("checking monitors");
      const monitors = await prisma.monitor.findMany({
        where: {
          isActive: true,
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
        },
      });

      await Promise.all(
        monitors.map((monitor) =>
          limit(async () => {
            const { monitorStatus, latency, statusCode } =
              await checkMonitor(monitor);
            console.log(monitorStatus, latency, statusCode);
            await createTick(monitor.id, monitorStatus, statusCode, latency);
            if (monitorStatus === "DOWN") {
              await sendAlert(monitor, new Date(), true);
            }
            if (monitor.ticks[0]?.status === "DOWN" && monitorStatus === "UP") {
              await sendAlert(monitor, new Date(), false);
            }
          }),
        ),
      );
    } catch (error) {
      console.log(error);
    }
  },
  null,
  true,
  "Asia/Kolkata",
);
