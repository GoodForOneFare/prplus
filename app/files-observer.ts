import {isFilesView} from './dom-helpers';
import {initializeFile} from './file';
import {updateToolbarSummary} from './toolbar';

function initializeFilesTab() {
  if (!isFilesView()) {
    return;
  }

  const initialFiles = document.querySelectorAll('.js-file');
  initialFiles.forEach((addedFile) => {
    initializeFile(addedFile as HTMLElement);
  });

  updateToolbarSummary();

  const filesObserver = new MutationObserver((mutationsList) => {
    mutationsList.forEach(({addedNodes}) => {
      const addedFiles = Array.from(addedNodes)
        .filter(
          (element): element is HTMLElement => element instanceof HTMLElement,
        )
        .filter((element) => element.classList?.contains('js-file'));
      addedFiles.forEach((addedFile) => {
        initializeFile(addedFile);
      });
    });

    updateToolbarSummary();
  });

  for (const filesContainer of document.querySelectorAll(
    '#files .js-diff-progressive-container',
  )) {
    filesObserver.observe(filesContainer, {
      attributes: false,
      characterData: false,
      characterDataOldValue: false,
      childList: true,
      subtree: false,
    });
  }
}

const tabObserver = new MutationObserver(() => {
  if (isFilesView()) {
    initializeFilesTab();
  }
});

tabObserver.observe(document.querySelector('main')!, {
  childList: true,
  subtree: false,
});

initializeFilesTab();
