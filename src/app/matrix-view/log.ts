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
     * @param _prefix prefix to prepend before each log statement.
     */
    constructor(private _prefix: string = '') {
        this.consoleLogger = (log: MessageProvider) => {
            console.log(this._prefix + log());
        };
    }

    /**
     * Logger, which logs to the console.
     * @param log message to log (as lambda)
     */
    private consoleLogger: (log: MessageProvider) => void;

    /** static log level, internally represented as number for quick checks */
    private static _level: number;

    static get level(): LogLevel {
        switch (Log._level) {
            case 1:
                return 'info';
            case 2:
                return 'debug';
            case 3:
                return 'trace';
            default:
                return 'off';
        }
    }

    /**
     * @param value new log level, which causes an update of the logger configuration.
     */
    static set level(value: LogLevel) {
        switch (value) {
            case 'info':
                Log._level = 1;
                break;
            case 'debug':
                Log._level = 2;
                break;
            case 'trace':
                Log._level = 3;
                break;
            default:
                Log._level = 0;
        }
    }

    /**
     * log on info level.
     * @param log function, which provides the message to log.
     */
    public info(log: MessageProvider) {
        if (Log._level >= 1) {
            this.consoleLogger(log);
        }
    }

    /**
     * log on debug level.
     * @param log function, which provides the message to log.
     */
    public debug(log: MessageProvider) {
        if (Log._level >= 2) {
            this.consoleLogger(log);
        }
    }

    /**
     * log on trace level.
     * @param log function, which provides the message to log.
     */
    public trace(log: MessageProvider) {
        if (Log._level >= 3) {
            this.consoleLogger(log);
        }
    }
}
