import winston from "winston";

export default class Logger {
  private static logger: winston.Logger | null = null;

  private constructor() {}

  public static getLogger = (): winston.Logger => {
    if (!Logger.logger) {
      Logger.logger = winston.createLogger({
        level: "info",
        format: winston.format.combine(winston.format.timestamp(), winston.format.ms(), winston.format.json()),
        transports: [
          new winston.transports.File({
            level: "error",
            filename: `${__dirname}/../application-error.log`,
          }),
          new winston.transports.File({
            filename: `${__dirname}/../application.log`,
          }),
        ],
      });
    }

    return Logger.logger;
  };
}
