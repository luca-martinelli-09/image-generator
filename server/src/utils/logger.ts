export interface LogEntry {
  level: "info" | "warn" | "error";
  message: string;
  data?: unknown;
  timestamp: string;
}

export function createLogEntry(
  level: LogEntry["level"],
  message: string,
  data?: unknown
): LogEntry {
  return {
    level,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
}

export function logError(error: unknown, context?: string): void {
  const logData = {
    error: error,
    message: error instanceof Error ? error.message : "Unknown error",
    stack: error instanceof Error ? error.stack : undefined,
    type: typeof error,
    name: error instanceof Error ? error.name : undefined,
    context,
  };

  console.error(
    "Full error details:",
    createLogEntry("error", "API Error", logData)
  );
}

export function logInfo(message: string, data?: unknown): void {
  console.log(createLogEntry("info", message, data));
}

export function logWarning(message: string, data?: unknown): void {
  console.warn(createLogEntry("warn", message, data));
}
