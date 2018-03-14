/**
 * Constants to determine the current browser, inspired by  https://stackoverflow.com/a/9851769/1458343.
 */

/**
 * flag to indicate if the current browser is IE (>10)
 * @type {boolean}
 */
export const isInternetExplorer = /*@cc_on!@*/false || !!(document as any).documentMode;

/**
 * cached value for the scroll width, to avoid expensive recomputation of the value.
 */
export const scrollbarWidth: number = computeScrollbarWidth();

/**
 * Compute scrollbar width, inspired by https://stackoverflow.com/a/8079681/1458343
 * @returns {number} scrollbar with in px.
 */
function computeScrollbarWidth() {
    let div = document.createElement('div');
    div.innerHTML =
        '<div style="width:50px;height:50px;position:absolute;left:-50px;top:-50px;overflow:auto;">' +
        '<div style="width:1px;height:100px;"></div>' +
        '</div>';
    div = <HTMLDivElement>div.firstChild;
    document.body.appendChild(div);
    const width = div.offsetWidth - div.clientWidth;
    document.body.removeChild(div);
    return width;
}

