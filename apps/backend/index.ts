import express from "express";
import authRouter from "./routes/auth.route";
import monitorRouter from "./routes/monitor.route";
import { PORT } from "./config";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (_req, res) => {
  res.send("Healthy Server!");
});

app.use("/api/auth", authRouter);
app.use("/api/monitors", monitorRouter);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
