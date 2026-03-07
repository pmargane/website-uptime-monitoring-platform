import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import {
  addMonitorController,
  deleteMonitorController,
  fetchMonitorByIdController,
  fetchMonitorsController,
  toggleMonitorActiveController,
} from "../controllers/monitor.controller";

const monitorRouter = Router();

monitorRouter.post("/", authMiddleware, addMonitorController);
monitorRouter.get("/", authMiddleware, fetchMonitorsController);
monitorRouter.get("/:id", authMiddleware, fetchMonitorByIdController);
monitorRouter.patch("/:id", authMiddleware, toggleMonitorActiveController);
monitorRouter.delete("/:id", authMiddleware, deleteMonitorController);

export default monitorRouter;
