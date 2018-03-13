/**
 * Constants to determine the current browser, inspired by  https://stackoverflow.com/a/9851769/1458343.
 */

/**
 * flag to indicate if the current browser is IE (>10)
 * @type {boolean}
 */
export const isInternetExplorer = /*@cc_on!@*/false || !!(document as any).documentMode;
