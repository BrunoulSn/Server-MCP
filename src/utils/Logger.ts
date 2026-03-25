export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LevelPriority: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
};

function timestamp(): string {
  return new Date().toISOString();
}

function formatMessage(level: LogLevel, tag: string, message: string | unknown): string {
  const userMessage = typeof message === 'string' ? message : JSON.stringify(message, null, 2);
  return `[${timestamp()}] [${level.toUpperCase()}] [${tag}] ${userMessage}`;
}

export class Logger {
  private tag: string;
  private minLevel: LogLevel;

  constructor(tag = 'app', minLevel: LogLevel = 'debug') {
    this.tag = tag;
    this.minLevel = minLevel;
  }

  setLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return LevelPriority[level] >= LevelPriority[this.minLevel];
  }

  debug(message: string | unknown, ...args: unknown[]): void {
    if (!this.shouldLog('debug')) return;
    console.debug(formatMessage('debug', this.tag, message), ...args);
  }

  info(message: string | unknown, ...args: unknown[]): void {
    if (!this.shouldLog('info')) return;
    console.info(formatMessage('info', this.tag, message), ...args);
  }

  warn(message: string | unknown, ...args: unknown[]): void {
    if (!this.shouldLog('warn')) return;
    console.warn(formatMessage('warn', this.tag, message), ...args);
  }

  error(message: string | unknown, ...args: unknown[]): void {
    if (!this.shouldLog('error')) return;
    console.error(formatMessage('error', this.tag, message), ...args);
  }
}

export const defaultLogger = new Logger('app', 'debug');
