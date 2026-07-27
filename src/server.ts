import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { env } from "./config";
import { AppError } from "./utils";
import { authRoutes, userRoutes, orgRoutes, postRoutes, pollRoutes, eventRoutes } from "./routes";

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
app.use("/orgs", orgRoutes);
app.use("/posts", postRoutes);
app.use("/", pollRoutes);
app.use("/", eventRoutes);

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

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${env.NODE_ENV} mode`);
  });
}

export default app;
