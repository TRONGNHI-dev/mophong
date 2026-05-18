import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { authRouter } from "./routes/auth.routes.js";
import { sessionRouter } from "./routes/session.routes.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true
  })
);
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    name: "Bizprac API",
    status: "ok",
    routes: ["/api/auth/login", "/api/auth/register", "/api/sessions"]
  });
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/auth", authRouter);
app.use("/api/sessions", sessionRouter);
app.use("/sessions", sessionRouter);

app.use((req, res) => {
  res.status(404).json({ message: `Không tìm thấy API: ${req.method} ${req.originalUrl}` });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({
    message: error.message || "Máy chủ gặp lỗi."
  });
});

app.listen(port, () => {
  console.log(`Bizprac API đang chạy tại http://localhost:${port}`);
});
