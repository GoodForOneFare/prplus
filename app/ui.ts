/* global __webpack_public_path__:true */
/* env webextensions */
import 'regenerator-runtime';
import {render} from 'react-dom';
import {createElement} from 'react';

import {generateCommands} from './commands';
import {FilterManager} from './filter-manager';
import {GithubUI} from './github-ui';

// Async chunk loading requires a plugin-relative base path.
// @ts-expect-error
// eslint-disable-next-line @typescript-eslint/camelcase
__webpack_public_path__ = chrome.runtime.getURL('');

const filterManager = new FilterManager();

const githubUI = new GithubUI();
githubUI.initialize();
githubUI.addFilesListener({
  addedFiles(files) {
    files
      .filter((file) => filterManager.isHidden(file))
      .forEach((file) => file.hide());
  },
  cleared() {},
});

(function initializeCommandPalette() {
  requestIdleCallback(async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const Container = (
      await import(/* webpackChunkName: "react-ui" */ './components')
    ).Container;

    requestIdleCallback(() => {
      render(
        createElement(Container, {
          commands: generateCommands(githubUI, filterManager),
        }),
        container,
      );
    });
  });
})();
