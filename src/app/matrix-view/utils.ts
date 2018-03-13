let scrollbarWidth: number;

/**
 * Compute scrollbar width, inspired by https://stackoverflow.com/a/8079681/1458343
 * @returns {number} scrollbar with in px.
 */
export function getScrollbarWidth() {
    if (scrollbarWidth === undefined) {
        let div = document.createElement('div');
        div.innerHTML =
            '<div style="width:50px;height:50px;position:absolute;left:-50px;top:-50px;overflow:auto;">' +
            '<div style="width:1px;height:100px;"></div>' +
            '</div>';
        div = <HTMLDivElement>div.firstChild;
        document.body.appendChild(div);
        scrollbarWidth = div.offsetWidth - div.clientWidth;
        document.body.removeChild(div);
    }
    return scrollbarWidth;
}


/**
 * General interface for box sizes.
 */
export interface BoxSize {
    width: number;
    height: number;
}

/**
 * General interface for 2D points.
 */
export interface Point2D {
    top: number;
    left: number;
}
