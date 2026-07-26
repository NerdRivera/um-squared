import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { env } from "./config";
import { authenticateToken } from "./middleware";
import { AppError } from "./utils";
import { authRoutes, userRoutes } from "./routes";

const app = express();
const PORT = env.PORT;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/static", express.static("static"));

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
// app.use("/posts", authenticateToken, postRoutes);
// app.use("/orgs", authenticateToken, orgRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message, code: err.code });
    return;
  }
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${env.NODE_ENV} mode`);
});

export default app;
