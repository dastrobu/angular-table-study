import {BoxSize, Point2D, RowCol} from '../utils';
import {EventEmitter} from '@angular/core';

/**
 * A cell objects wraps a cell value, and adds some metadata, like {@link #index}, {@link position} and {@link #size}
 */
export interface Cell<CellValueType> {

    /** index of the cell on the canvas */
    readonly index: RowCol<number>;

    /** cell value */
    readonly value: CellValueType;

    /** position of the cell (in px) */
    readonly position: Point2D;

    /** size of the cell (in px) */
    readonly size: BoxSize;

    hover: boolean;
}

/**
 * event, fired on a cell
 */
export interface MouseCellEvent<CellValueType> {
    event: MouseEvent;
    cell: Cell<CellValueType>;
}

/**
 * all mouse events that can be fired on a cell.
 * @see https://www.w3schools.com/jsref/dom_obj_event.asp
 */
export interface CellEventEmitter<CellValueType> {
    readonly click: EventEmitter<MouseCellEvent<CellValueType>>;
    readonly contextmenu: EventEmitter<MouseCellEvent<CellValueType>>;
    readonly dblclick: EventEmitter<MouseCellEvent<CellValueType>>;
    readonly mousedown: EventEmitter<MouseCellEvent<CellValueType>>;
    readonly mouseenter: EventEmitter<MouseCellEvent<CellValueType>>;
    readonly mouseleave: EventEmitter<MouseCellEvent<CellValueType>>;
    readonly mousemove: EventEmitter<MouseCellEvent<CellValueType>>;
    readonly mouseover: EventEmitter<MouseCellEvent<CellValueType>>;
    readonly mouseout: EventEmitter<MouseCellEvent<CellValueType>>;
    readonly mouseup: EventEmitter<MouseCellEvent<CellValueType>>;
}
