/**
 * Simple configurable logger.
 */

/**
 * log lambda, which is employed to pass log messages as lambdas, to defer log message creation to the point, where
 * it is clear if the log message will be shown or not.
 */
declare type MessageProvider = () => string;

/**
 * No operation logger, which simply ignores the log.
 * @param log message to log (as lambda)
 */
function noopLogger(log: MessageProvider): void {
}

/**
 * Logger, which logs to the console.
 * @param log message to log (as lambda)
 */
function consoleLogger(log: MessageProvider): void {
    console.log(log());
}

/**
 * Union type for log levels.
 */
export type LogLevel = 'off' | 'info' | 'debug' | 'trace';

/**
 * a simple configurable logger class.
 */
export class Log {

    get level() {
        return this._level;
    }

    /**
     * current log level
     */
    private _level: LogLevel;
    private infoLogger: (log: MessageProvider) => void = noopLogger;
    private debugLogger: (log: MessageProvider) => void = noopLogger;
    private traceLogger: (log: MessageProvider) => void = noopLogger;

    /**
     * @param value new log level, which causes an update of the logger configuration.
     */
    set level(value) {
        this._level = value;
        switch (value) {
            case 'info':
                this.infoLogger = consoleLogger;
                this.debugLogger = noopLogger;
                this.traceLogger = noopLogger;
                break;
            case 'debug':
                this.infoLogger = consoleLogger;
                this.debugLogger = consoleLogger;
                this.traceLogger = noopLogger;
                break;
            case 'trace':
                this.infoLogger = consoleLogger;
                this.debugLogger = consoleLogger;
                this.traceLogger = consoleLogger;
                break;
            default:
                this.infoLogger = noopLogger;
                this.debugLogger = noopLogger;
                this.traceLogger = noopLogger;
        }
    }

    /**
     * log on info level.
     * @param log function, which provides the message to log.
     */
    public info(log: MessageProvider) {
        this.infoLogger(log);
    }

    /**
     * log on debug level.
     * @param log function, which provides the message to log.
     */
    public debug(log: MessageProvider) {
        this.debugLogger(log);
    }

    /**
     * log on trace level.
     * @param log function, which provides the message to log.
     */
    public trace(log: MessageProvider) {
        this.traceLogger(log);
    }
}
