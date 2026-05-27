import { createServer } from "http";

import { env } from "./config";
import { disconnectPrisma } from "./lib/prisma";
import { logger } from "./lib/logger";
import { app } from "./app";

const server = createServer(app);

server.listen(env.PORT, () => {
  logger.info({ port: env.PORT, environment: env.NODE_ENV }, "texify backend started");
});

async function shutdown(signal: string): Promise<void> {
  logger.info({ signal }, "Shutdown signal received");

  server.close(async () => {
    await disconnectPrisma();
    process.exit(0);
  });
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});