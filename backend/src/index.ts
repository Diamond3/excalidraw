import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { createServer } from "http";
import { runMigrations } from "./db";
import { setupWebSocket } from "./ws";
import scenesRouter from "./routes/scenes";
import filesRouter from "./routes/files";
import shareLinksRouter from "./routes/shareLinks";
import workspacesRouter from "./routes/workspaces";
import authRouter from "./routes/auth";
import { isAuthEnabled, requireAuth } from "./auth";

const app = express();
app.set("trust proxy", true);
const httpServer = createServer(app);

app.use(cors({ credentials: true, origin: true }));
app.use("/api/auth", express.json());
app.use("/api/scenes", express.json({ limit: "50mb" }));
app.use("/api/files", express.json({ limit: "50mb" }));

app.use("/api/auth", authRouter);

if (isAuthEnabled()) {
  app.use("/api/scenes", requireAuth);
  app.use("/api/files", requireAuth);
  app.use("/api/v2", requireAuth);
  app.use("/api/workspaces", requireAuth);
}

app.use("/api/scenes", scenesRouter);
app.use("/api/files", filesRouter);
app.use("/api/v2", shareLinksRouter);
app.use("/api/workspaces", workspacesRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

setupWebSocket(httpServer);

const PORT = Number(process.env.PORT) || 3002;

const start = async () => {
  try {
    await runMigrations();
    console.log("Migrations complete");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }

  httpServer.listen(PORT, "::", () => {
    console.log(`Backend server running on port ${PORT}`);
  });
};

start();
