import { createServer } from "http";

import { env } from "./config";
import { disconnectPrisma, prisma } from "./lib/prisma";
import { logger } from "./lib/logger";
import { app } from "./app";

const server = createServer(app);

server.listen(env.PORT, async () => {
  logger.info({ port: env.PORT, environment: env.NODE_ENV }, "texify backend started");
  // One-time reset: clear GSTIN renewal cooldown so the new guerrillamail renewer runs on next lookup
  try {
    await prisma.systemSetting.deleteMany({ where: { key: "gstin_last_renewal_attempt" } });
  } catch { /* ignore if table doesn't exist yet */ }
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