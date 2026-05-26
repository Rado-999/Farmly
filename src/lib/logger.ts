type LogLevel = "info" | "warn" | "error";

type LoggerParams = {
  operation: string;
  message: string;
  userId?: string;
  farmerId?: string;
  errorCode?: string;
  context?: Record<string, unknown>;
  error?: unknown;
};

function serializeError(error: unknown) {
  if (!error) {
    return undefined;
  }

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  if (typeof error === "object") {
    return error;
  }

  return { value: String(error) };
}

function writeLog(level: LogLevel, params: LoggerParams) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    operation: params.operation,
    message: params.message,
    userId: params.userId,
    farmerId: params.farmerId,
    errorCode: params.errorCode,
    context: params.context,
    error: serializeError(params.error),
  };

  try {
    console[level](JSON.stringify(entry));
  } catch {
    console[level](entry);
  }
}

export const logger = {
  info(params: LoggerParams) {
    writeLog("info", params);
  },
  warn(params: LoggerParams) {
    writeLog("warn", params);
  },
  error(params: LoggerParams) {
    writeLog("error", params);
  },
};
