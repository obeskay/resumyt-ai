// Basic monitoring implementation without Sentry
type LogLevel = "info" | "warn" | "error";

interface LogMessage {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
}

class Monitoring {
  private static instance: Monitoring;
  private logs: LogMessage[] = [];
  private readonly MAX_LOGS = 0;

  private constructor() {}

  static getInstance(): Monitoring {
    if (!Monitoring.instance) {
      Monitoring.instance = new Monitoring();
    }
    return Monitoring.instance;
  }

  private addLog(level: LogLevel, message: string, data?: any) {
    const logMessage: LogMessage = {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
    };

    this.logs.unshift(logMessage);

    // Keep logs under limit
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(0, this.MAX_LOGS);
    }

    // Also log to console in development
    if (process.env.NODE_ENV === "development") {
      console[level](message, data);
    }
  }

  info(message: string, data?: any) {
    this.addLog("info", message, data);
  }

  warn(message: string, data?: any) {
    this.addLog("warn", message, data);
  }

  error(message: string, data?: any) {
    this.addLog("error", message, data);
  }

  getLogs(): LogMessage[] {
    return [...this.logs];
  }
}

export const monitoring = Monitoring.getInstance();

export function initMonitoring() {
  // Initialize any monitoring configuration here
  console.log("Monitoring initialized");
}

export function captureException(error: Error) {
  monitoring.error(error.message, {
    stack: error.stack,
    name: error.name,
  });
}

export function captureMessage(message: string) {
  monitoring.info(message);
}
