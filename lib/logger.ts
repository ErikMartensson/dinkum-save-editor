import Logger from "https://deno.land/x/logger@v1.2.0/logger.ts";

const logger = new Logger();
await logger.initFileLogger("./log", {
  rotate: true,
  maxBytes: 1000 * 1024, // 1 MB
  maxBackupCount: 10, // Keep 10 backup files
});

export { logger };
