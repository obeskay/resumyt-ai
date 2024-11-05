type LogLevel = "error";

class Logger {
  private log(level: LogLevel, message: string, ...args: any[]) {
    const timestamp = new Date().toISOString();
    console[level](
      `[${timestamp}] [${level.toUpperCase()}] ${message}`,
      ...args,
    );
  }

  error(message: string, ...args: any[]) {
    this.log("error", message, ...args);
  }
}

export const logger = new Logger();
