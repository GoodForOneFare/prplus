import {render} from 'react-dom';
import {createElement} from 'react';

import {generateCommands} from './commands';
import {FilterManager} from './filter-manager';
import {GithubUI} from './github-ui';
import {Storage} from './storage';

const filterManager = new FilterManager();

const githubUI = new GithubUI();
githubUI.initialize();

const storage = new Storage(githubUI.prId);
storage.initialize();

githubUI.addFilesListener({
  addedFiles(files) {
    files
      .filter((file) => filterManager.isHidden(file))
      .forEach((file) => file.hide());

    files.forEach((file) => {
      file.highlightReviewLines(storage.getReviewedLines(file));
    });
  },
  cleared() {},
});

const prId = githubUI.prId;
if (prId) {
  if (!localStorage[prId]) {
    localStorage[prId] = JSON.stringify({});
  }

  githubUI.addReviewLineListener((file) => {
    if (file) {
      const selections = file.getSelectedLines();
      file.highlightReviewLines(selections);
      storage.addReviewedLines(file, selections);
      storage.save();
    }
  });
}

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
          commands: generateCommands(
            githubUI,
            (file) => {
              const reviewedLines = storage.getReviewedLines(file);
              file.clearReviewedLines(reviewedLines);
              storage.clearReviewLines(file);
              storage.save();
            },
            filterManager,
          ),
        }),
        container,
      );
    });
  });
})();
