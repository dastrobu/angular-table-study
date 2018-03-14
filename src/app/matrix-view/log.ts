/**
 * Simple configurable logger.
 */

/**
 * log lambda, which is employed to pass log messages as lambdas, to defer log message creation to the point, where
 * it is clear if the log message will be shown or not.
 */
declare type MessageProvider = () => string;


/**
 * Union type for log levels.
 */
export type LogLevel = 'off' | 'info' | 'debug' | 'trace';

/**
 * a simple configurable logger class.
 */
export class Log {

    /**
     * No operation logger, which simply ignores the log.
     * @param log message to log (as lambda)
     */
    private noopLogger: (log: MessageProvider) => void;
    /**
     * Logger, which logs to the console.
     * @param log message to log (as lambda)
     */
    private consoleLogger: (log: MessageProvider) => void;
    private infoLogger: (log: MessageProvider) => void;

    get level() {
        return this._level;
    }

    /**
     * current log level
     */
    private _level: LogLevel;
    private debugLogger: (log: MessageProvider) => void;
    private traceLogger: (log: MessageProvider) => void;

    constructor(private _prefix: string = '') {
        this.noopLogger = (log: MessageProvider) => {
        };
        this.consoleLogger = (log: MessageProvider) => {
            console.log(this._prefix + log());
        };
        this.infoLogger = this.noopLogger;
        this.debugLogger = this.noopLogger;
        this.traceLogger = this.noopLogger;
    }

    /**
     * @param value new log level, which causes an update of the logger configuration.
     */
    set level(value) {
        this._level = value;
        switch (value) {
            case 'info':
                this.infoLogger = this.consoleLogger;
                this.debugLogger = this.noopLogger;
                this.traceLogger = this.noopLogger;
                break;
            case 'debug':
                this.infoLogger = this.consoleLogger;
                this.debugLogger = this.consoleLogger;
                this.traceLogger = this.noopLogger;
                break;
            case 'trace':
                this.infoLogger = this.consoleLogger;
                this.debugLogger = this.consoleLogger;
                this.traceLogger = this.consoleLogger;
                break;
            default:
                this.infoLogger = this.noopLogger;
                this.debugLogger = this.noopLogger;
                this.traceLogger = this.noopLogger;
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
