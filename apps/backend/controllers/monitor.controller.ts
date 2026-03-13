import type { Request, Response } from "express";
import prisma from "@repo/database";
import { AddMonitorSchema } from "@repo/schemas";

const addMonitorController = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const validationResult = AddMonitorSchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        data: null,
        error: "Invalid request body",
      });
      return;
    }

    const { url, name } = validationResult.data;

    const monitor = await prisma.monitor.create({
      data: {
        name,
        url,
        userId,
      },
    });

    res.status(201).json({
      success: true,
      data: monitor,
      error: null,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      data: null,
      error: "Internal Server Error",
    });
  }
};

const fetchMonitorsController = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const monitors = await prisma.monitor.findMany({
      where: {
        userId,
      },
      include: {
        ticks: {
          select: {
            checkedAt: true,
            status: true,
            latency: true,
            statusCode: true,
          },
          orderBy: {
            checkedAt: "desc",
          },
          take: 1,
        },
      },
    });

    res.status(200).json({
      success: true,
      data: monitors.map((monitor) => ({
        id: monitor.id,
        name: monitor.name,
        url: monitor.url,
        status: monitor.ticks[0]?.status,
        lastChecked: monitor.ticks[0]?.checkedAt,
        responseTime: monitor.ticks[0]?.latency,
        isActive: monitor.isActive,
      })),
      error: null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      error: "Internal Server Error",
    });
  }
};

const fetchMonitorByIdController = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const monitorId = req.params.id as string;

    const monitor = await prisma.monitor.findUnique({
      where: {
        id: monitorId,
        userId,
      },
      include: {
        ticks: true,
      },
    });

    if (!monitor) {
      res.status(404).json({
        success: false,
        data: null,
        error: "Monitor not found",
      });
      return;
    }

    const totalTicksLength = monitor.ticks.length || 0;

    res.status(200).json({
      success: true,
      data: {
        ...monitor,
        lastChecked: monitor.ticks[totalTicksLength - 1]?.checkedAt,
        status: monitor.ticks[totalTicksLength - 1]?.status,
        latency: monitor.ticks[totalTicksLength - 1]?.latency,
      },
      error: null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      error: "Internal Server Error",
    });
  }
};

const toggleMonitorActiveController = async (req: Request, res: Response) => {
  try {
    const monitorId = req.params.id as string;
    const userId = req.userId!;

    const monitor = await prisma.monitor.findUnique({
      where: {
        id: monitorId,
        userId,
      },
    });

    if (!monitor) {
      res.status(404).json({
        success: false,
        data: null,
        error: "Monitor not found",
      });
      return;
    }

    const updatedMonitor = await prisma.monitor.update({
      where: {
        id: monitorId,
        userId,
      },
      data: {
        isActive: monitor.isActive === "ACTIVE" ? "PAUSED" : "ACTIVE",
      },
    });

    res.status(200).json({
      success: true,
      data: {
        message: "Monitor toggled successfully",
        monitor: updatedMonitor,
      },
      error: null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      error: "Internal Server Error",
    });
  }
};

const deleteMonitorController = async (req: Request, res: Response) => {
  try {
    const monitorId = req.params.id as string;
    const userId = req.userId!;

    const monitor = await prisma.monitor.findUnique({
      where: {
        id: monitorId,
        userId,
      },
    });

    if (!monitor) {
      res.status(404).json({
        success: false,
        data: null,
        error: "Monitor not found",
      });
      return;
    }

    const deletedMonitor = await prisma.monitor.delete({
      where: {
        id: monitorId,
        userId,
      },
    });

    res.status(200).json({
      success: true,
      data: deletedMonitor,
      error: null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      error: "Internal Server Error",
    });
  }
};

export {
  addMonitorController,
  fetchMonitorsController,
  fetchMonitorByIdController,
  toggleMonitorActiveController,
  deleteMonitorController,
};
