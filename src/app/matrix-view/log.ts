declare type LogLambda = () => string;

function noopLogger(log: LogLambda): void {
}

function consoleLogger(log: LogLambda): void {
    console.log(log());
}

export type LogLevel = 'off' | 'info' | 'debug' | 'trace';

/**
 * a simple configurable logger class.
 */
export class Log {

    get level() {
        return this._level;
    }

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

    private _level: LogLevel;

    private infoLogger: (log: LogLambda) => void;
    private debugLogger: (log: LogLambda) => void;
    private traceLogger: (log: LogLambda) => void;

    public info(log: LogLambda) {
        this.infoLogger(log);
    }

    public debug(log: LogLambda) {
        this.debugLogger(log);
    }

    public trace(log: LogLambda) {
        this.traceLogger(log);
    }
}
