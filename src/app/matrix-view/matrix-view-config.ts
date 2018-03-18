import {Log, LogLevel} from './log';
import {BoxCorners, BoxSides, BoxSize} from './utils';
import {DefaultTileRenderStrategy, TileRenderStrategy} from './tile-renderer/tile-render-strategy';

export const defaults = {
    logLevel: 'off' as LogLevel,
    rowHeight: 20,
    colWidth: 40,
    showFixed: {top: 0, left: 0, right: 0, bottom: 0} as BoxSides<number>,
    tileSize: {width: 200, height: 500} as BoxSize,
};

export interface MatrixViewConfig {
    /**
     * configure if fixed corners shall be shown.
     * The configuration can either be done globally, i.e. via a boolean, which configures all fixed corners,
     * or for each corner individually, via an object
     * <pre>
     * {
     *      topLeft?: boolean,
     *      topRight?: boolean,
     *      bottomLeft?: boolean,
     *      bottomRight?: boolean,
     * }
     * </pre>
     * If the global boolean or one of the individual properties is not set, the property is determined automatically.
     */
    readonly showFixedCorners?: boolean | { topLeft?: boolean, topRight?: boolean, bottomLeft?: boolean, bottomRight?: boolean };

    /**
     * configure how many cols or rows shall be shown in the fixed areas. If the number is not set or 0, no fixed area
     * is shown.
     */
    readonly showFixed?: { top: number, left: number, right: number, bottom: number };

    /**
     * log level for debugging purposes
     */
    readonly logLevel?: LogLevel;

    /**
     * size of the tiles to use for the virtual dom.
     */
    readonly tileSize?: BoxSize;

    /**
     * strategy to determine which tiles to render.
     */
    readonly tileRenderStrategy?: TileRenderStrategy;
}

export class Config implements MatrixViewConfig {
    showFixed: BoxSides<number> = defaults.showFixed;
    logLevel: LogLevel = defaults.logLevel;
    tileSize: BoxSize = defaults.tileSize;
    showFixedCorners: BoxCorners<boolean> = {
        topLeft: false,
        topRight: false,
        bottomLeft: false,
        bottomRight: false,
    };
    private readonly log: Log = new Log(this.constructor.name + ':');
    tileRenderStrategy: TileRenderStrategy = new DefaultTileRenderStrategy();

    /** copy constructor, which extracts all information and stores it */
    constructor(config?: MatrixViewConfig) {
        if (!config) {
            return;
        }

        // log level must be updated first, so that logging works correctly
        if (config.logLevel !== undefined && config.logLevel !== null) {
            this.logLevel = config.logLevel;
            this.log.level = this.logLevel;
            this.log.info(() => `did set logLevel: ${this.logLevel}`);
        }

        if (config.tileSize !== undefined && config.tileSize !== null) {
            this.tileSize = config.tileSize;
            this.log.info(() => `did set tileSize: ${JSON.stringify(this.tileSize)}`);
        }

        if (config.tileRenderStrategy !== undefined && config.tileRenderStrategy !== null) {
            this.tileRenderStrategy = config.tileRenderStrategy;
            this.log.info(() => `did set tileRenderStrategy: ${this.tileRenderStrategy}`);
        }

        // pass tile size to renderer strategy
        this.tileRenderStrategy.tileSize = this.tileSize;

        // determine fixed config
        if (config.showFixed !== undefined && config.showFixed !== null) {
            this.showFixed = {
                top: config.showFixed.top,
                bottom: config.showFixed.bottom,
                left: config.showFixed.left,
                right: config.showFixed.right,
            };
            this.log.info(() => 'did set config.showFixed: ' + JSON.stringify(this.showFixed));
        }
        // determine config of fixed corners
        if (config.showFixedCorners !== undefined && config.showFixedCorners !== null) {
            if (config.showFixedCorners === true) {
                this.showFixedCorners = {bottomLeft: true, bottomRight: true, topLeft: true, topRight: true};
            } else if (config.showFixedCorners === false) {
                this.showFixedCorners = {bottomLeft: false, bottomRight: false, topLeft: false, topRight: false};
            } else {
                this.showFixedCorners = config.showFixedCorners as BoxCorners<boolean>;
            }
            this.log.info(() => 'did set config.showFixedCorners: ' + JSON.stringify(this.showFixedCorners));
        } else {
            // determine visibility of fixed corners automatically, if not set explicitly
            this.showFixedCorners = {
                topLeft: Boolean(this.showFixed.top && this.showFixed.left),
                topRight: Boolean(this.showFixed.top && this.showFixed.right),
                bottomRight: Boolean(this.showFixed.bottom && this.showFixed.right),
                bottomLeft: Boolean(this.showFixed.bottom && this.showFixed.right),
            };
            this.log.info(() => {
                return `did set automatically config.showFixedCorners: ${JSON.stringify(this.showFixedCorners)}`;
            });
        }
    }

}

