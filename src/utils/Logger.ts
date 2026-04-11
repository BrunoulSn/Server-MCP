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
    this.log('debug', message, args);
  }

  info(message: string | unknown, ...args: unknown[]): void {
    this.log('info', message, args);
  }

  warn(message: string | unknown, ...args: unknown[]): void {
    this.log('warn', message, args);
  }

  error(message: string | unknown, ...args: unknown[]): void {
    this.log('error', message, args);
  }

  private log(level: LogLevel, message: string | unknown, args: unknown[]): void {
    if (!this.shouldLog(level)) return;
    const consoleMethods: Record<LogLevel, typeof console.debug> = {
      debug: console.debug,
      info: console.info,
      warn: console.warn,
      error: console.error
    };
    consoleMethods[level](formatMessage(level, this.tag, message), ...args);
  }
}

export const defaultLogger = new Logger('app', 'debug');
