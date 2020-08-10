/* global __webpack_public_path__:true */
/* env webextensions */
import 'regenerator-runtime';
import {render} from 'react-dom';
import {createElement} from 'react';

import {FilterManager, FileFilter} from './types';
import {FileMetadata} from './github-ui/file';
import {GithubUI} from './github-ui';
import {fileFilters} from './file-filters';
import {generateCommands} from './commands';

// Async chunk loading requires a plugin-relative base path.
// @ts-expect-error
// eslint-disable-next-line @typescript-eslint/camelcase
__webpack_public_path__ = chrome.runtime.getURL('');

let activeFilters: FileFilter[] = [];

const filterManager: FilterManager = {
  allFilters: fileFilters,
  activateFilter(type) {
    activeFilters.push(fileFilters[type]);
    hideFiles();
  },
  deactivateFilter(type) {
    const filter = fileFilters[type].filter;
    activeFilters = activeFilters.filter(
      (aFilter) => aFilter.filter !== filter,
    );
    showFiles(filter);
  },
};

function showFiles(filter: FileFilter['filter']) {
  githubUI.files.filter(filter).forEach((file) => {
    file.show();
  });
}

function hideFiles() {
  const hiddenFiles = activeFilters.reduce((acc, filter) => {
    githubUI.files
      .filter(filter.filter)
      .forEach((hiddenFile) => acc.add(hiddenFile));
    return acc;
  }, new Set<FileMetadata>());

  hiddenFiles.forEach((file) => {
    file.hide();
  });
}

const githubUI = new GithubUI();
githubUI.initialize();
githubUI.addFilesListener({
  addedFiles() {
    hideFiles();
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
