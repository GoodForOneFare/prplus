/* global __webpack_public_path__:true */
/* env webextensions */

// Async chunk loading requires a plugin-relative base path.
// @ts-expect-error
// eslint-disable-next-line @typescript-eslint/camelcase
__webpack_public_path__ = chrome.runtime.getURL('');
