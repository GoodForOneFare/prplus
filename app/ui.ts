import 'regenerator-runtime';
import {render} from 'react-dom';
import {createElement} from 'react';

import {generateCommands} from './commands';
import {PrStorage} from './PRStorage';
import {ReviewLines} from './ReviewLines';
import {ReviewLineObserver} from './ReviewLineObserver';
import {DiffType} from './types';

__webpack_public_path__ = chrome.runtime.getURL('');

const prId = window.location.pathname.replace(/(.+[/]pull[/]\d+).*/, '$1');
const diffType = document.querySelector<HTMLInputElement>(
  'input[name=diff][checked]',
)!.value as DiffType;

const storage = new PrStorage(prId);
const reviewLines = new ReviewLines(diffType, storage);

ReviewLineObserver.addBlockSelectionListener(
  reviewLines.handleReviewedSelection,
);
ReviewLineObserver.addSingleLineSelectionListener(
  reviewLines.handleReviewedSelection,
);

(function initializeCommandPalette() {
  requestAnimationFrame(async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const Container = (
      await import(/* webpackChunkName: "react-ui" */ './components')
    ).Container;

    requestAnimationFrame(() => {
      render(
        createElement(Container, {
          commands: generateCommands(),
          storage,
          reviewLines,
        }),
        container,
      );
    });
  });
})();
