import {LogLevel} from './log';

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
     * If the global boolean or one of the individual properties is not set, the property is determinded automatically.
     */
    showFixedCorners?: boolean | { topLeft?: boolean, topRight?: boolean, bottomLeft?: boolean, bottomRight?: boolean };

    /**
     * configure how many cols or rows shall be shown in the fixed areas. If the number is not set or 0, no fixed area
     * is shown.
     */
    showFixed: { top: number, left: number, right: number, bottom: number };

    /**
     * log level for debugging purposes
     */
    logLevel: LogLevel;
}

export class FullMatrixViewConfig implements MatrixViewConfig {

    logLevel: LogLevel = 'off';

    showFixed = {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    };
    showFixedCorners: { topLeft: boolean, topRight: boolean, bottomLeft: boolean, bottomRight: boolean } = {
        topLeft: false,
        topRight: false,
        bottomLeft: false,
        bottomRight: false,
    };

    constructor(config?: MatrixViewConfig) {
        if (!config) {
            return;
        }

        // determine fixed config
        if (config.showFixed !== undefined && config.showFixed !== null) {
            this.showFixed.top = config.showFixed.top;
            this.showFixed.bottom = config.showFixed.bottom;
            this.showFixed.left = config.showFixed.left;
            this.showFixed.right = config.showFixed.right;
        }
        // determine config of fixed corners
        if (config.showFixedCorners !== undefined && config.showFixedCorners !== null) {
            if (config.showFixedCorners === true) {
                this.showFixedCorners.topLeft = true;
                this.showFixedCorners.topRight = true;
                this.showFixedCorners.bottomLeft = true;
                this.showFixedCorners.bottomRight = true;
            } else if (config.showFixedCorners === false) {
                this.showFixedCorners.topLeft = false;
                this.showFixedCorners.topRight = false;
                this.showFixedCorners.bottomLeft = false;
                this.showFixedCorners.bottomRight = false;
            } else {
                this.showFixedCorners.topLeft = config.showFixedCorners.topLeft;
                this.showFixedCorners.topRight = config.showFixedCorners.topRight;
                this.showFixedCorners.bottomLeft = config.showFixedCorners.bottomLeft;
                this.showFixedCorners.bottomRight = config.showFixedCorners.bottomRight;
            }
        } else {
            // determine visibility of fixed corners automatically, if not set explicitly
            if (this.showFixed.top && this.showFixed.left) {
                this.showFixedCorners.topLeft = true;
            }
            if (this.showFixed.top && this.showFixed.right) {
                this.showFixedCorners.topRight = true;
            }
            if (this.showFixed.bottom && this.showFixed.left) {
                this.showFixedCorners.bottomLeft = true;
            }
            if (this.showFixed.bottom && this.showFixed.right) {
                this.showFixedCorners.bottomRight = true;
            }
        }

        this.logLevel = config.logLevel;
    }

}

