import winston from 'winston';

// Create custom format
const customFormat = winston.format.printf(({ level, message, timestamp }) => {
  const formattedMessage = typeof message === 'string' ? message : String(message);
  return `${String(timestamp)} [${String(level.toUpperCase())}]: ${formattedMessage}`;
});

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize(),
    customFormat
  ),
  transports: [
    new winston.transports.Console(),
    // Optional file transport for persistent logs
    // new winston.transports.File({ filename: 'changelog-generator.log' })
  ],
});

/**
 * Helper function to log an operation with timing
 * @param operationName Name of the operation
 * @param operation Function that performs the operation
 * @returns Result of the operation
 */
export async function logOperation<T>(
  operationName: string,
  operation: () => Promise<T>
): Promise<T> {
  logger.info(`Starting operation: ${operationName}`);
  const startTime = Date.now();
  try {
    const result = await operation();
    const duration = Date.now() - startTime;
    logger.info(`Completed operation: ${operationName} (${duration}ms)`);
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed operation: ${operationName} - ${errorMessage}`);
    throw error;
  }
}

export default logger;
