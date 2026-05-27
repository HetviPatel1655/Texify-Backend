import { logger } from "../src/lib/logger";

async function main(): Promise<void> {
  logger.info("Seed script executed. No seed data has been defined yet.");
}

main()
  .catch((error: unknown) => {
    logger.error({ error }, "Seed script failed");
    process.exitCode = 1;
  })
  .finally(async () => {
    process.exit(process.exitCode ?? 0);
  });