import pino from "pino";

import { env } from "../config";

const isDev = env.NODE_ENV !== "production";

export const logger = pino(
  isDev
    ? {
        level: env.LOG_LEVEL,
        messageKey: "message",
        base: { service: "texify-backend" },
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:HH:MM:ss",
            messageKey: "message",
            ignore: "pid,hostname,service,environment",
            singleLine: false
          }
        }
      }
    : {
        level: env.LOG_LEVEL,
        timestamp: pino.stdTimeFunctions.isoTime,
        messageKey: "message",
        base: { service: "texify-backend", environment: env.NODE_ENV },
        formatters: {
          level(label) {
            return { level: label.toUpperCase() };
          }
        }
      }
);
