import chalk from "chalk";

enum LogLevel {
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  DEBUG = "DEBUG",
  SYSTEM = "SYSTEM"
}

export interface ILoggerService {
  printWelcome(): void;
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  debug(message: string): void;
  system(message: string): void;
  setLogLevel(level: LogLevel): void;
}

class LoggerService implements ILoggerService {
  private static instance: LoggerService;
  private logLevel: LogLevel;

  private constructor(logLevel: LogLevel = LogLevel.INFO) {
    this.logLevel = logLevel;
  }

  public static getInstance(logLevel?: LogLevel): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService(logLevel);
    }
    return LoggerService.instance;
  }

  public printWelcome(): void {
    console.log(chalk.blue(`
              _____                                   
  _ __   __ _|  ___|__  _ __ _____   _____ _ __ 
 | '_ \\ / _\` | |_ / _ \\| '__/ _ \\ \\ / / _ \\ '__|
 | | | | (_| |  _| (_) | | |  __/\\ V /  __/ |   
 |_| |_|\\__, |_|  \\___/|_|  \\___| \\_/ \\___|_|   
        |___/                                   
      `));
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    let coloredLevel;

    switch (level) {
      case LogLevel.INFO:
        coloredLevel = chalk.blue(level);
        break;
      case LogLevel.WARN:
        coloredLevel = chalk.yellow(level);
        break;
      case LogLevel.ERROR:
        coloredLevel = chalk.red(level);
        break;
      case LogLevel.DEBUG:
        coloredLevel = chalk.magenta(level);
        break;
      case LogLevel.SYSTEM:
        const uncoloredMessage =  message;
        return `${uncoloredMessage}`;
    }

    return `[${timestamp}] ${coloredLevel}: ${message}`;
  }

  public system(message: string): void {
    console.log(this.formatMessage(LogLevel.SYSTEM, message));
  }

  public info(message: string): void {
    console.log(this.formatMessage(LogLevel.INFO, message));
  }

  public warn(message: string): void {
    if (this.logLevel === LogLevel.WARN || this.logLevel === LogLevel.ERROR || this.logLevel === LogLevel.DEBUG) {
      console.warn(this.formatMessage(LogLevel.WARN, message));
    }
  }

  public error(message: string): void {
    if (this.logLevel === LogLevel.ERROR || this.logLevel === LogLevel.DEBUG) {
      console.error(this.formatMessage(LogLevel.ERROR, message));
    }
  }

  public debug(message: string): void {
    if (this.logLevel === LogLevel.DEBUG) {
      console.debug(this.formatMessage(LogLevel.DEBUG, message));
    }
  }

  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }
}
export { LoggerService, LogLevel };