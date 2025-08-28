import express from "express";
import { config } from "./config";
import { globalErrorHandler } from "./middleware/errorHandler";
import apiRoutes from "./routes";
import { logError, logInfo } from "./utils/logger";

export function createApp(): express.Application {
  const app = express();

  // Middleware
  app.use(express.json({ limit: config.maxRequestSize }));

  // API routes
  app.use("/api", apiRoutes);

  // Global error handler (must be last)
  app.use(globalErrorHandler);

  return app;
}

export function startServer(): void {
  const app = createApp();

  const server = app.listen(config.port, () => {
    logInfo(`Server running at http://localhost:${config.port}`);
  });

  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      const nextPort = Number(config.port) + 1;
      logInfo(`Port ${config.port} is busy, trying ${nextPort}...`);

      const fallbackServer = app.listen(nextPort, () => {
        logInfo(`Server running at http://localhost:${nextPort}`);
      });

      fallbackServer.on("error", (fallbackErr: NodeJS.ErrnoException) => {
        logError(fallbackErr, "fallback-server");
        process.exit(1);
      });
    } else {
      logError(err, "primary-server");
      process.exit(1);
    }
  });

  // Graceful shutdown
  const shutdown = (signal: string) => {
    logInfo(`Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      logInfo("Server closed successfully");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}
