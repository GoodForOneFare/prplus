import {isFilesView} from './dom-helpers';
import {findFile, initializeFile, updateHeader} from './file';
import {updateToolbarSummary} from './toolbar';

document.body.removeEventListener('click', updateToolbarSummary);
document.body.addEventListener('click', () => {
  setTimeout(updateToolbarSummary, 500);
});

updateToolbarSummary();

document.body.addEventListener('click', (evt) => {
  if (!evt.metaKey) {
    return;
  }

  const target = evt.target as HTMLElement;
  if (
    target.classList.contains('blob-num-addition') ||
    target.classList.contains('blob-num-deletion')
  ) {
    if (!evt.altKey) {
      evt.preventDefault();
      const tr = target.closest('tr');
      findFile(tr).markReviewedLines([tr], {updateUI: true});
      updateHeader(tr.closest('.js-file'));
    }
  }
});

let isDragging = false;
document.addEventListener('mousedown', (evt) => {
  if (!evt.metaKey) {
    return;
  }
  const target = evt.target as HTMLElement;
  isDragging = target.tagName === 'TD' && target.classList.contains('blob-num');
});

document.addEventListener('mouseup', (evt) => {
  if (!isDragging) {
    return;
  }

  isDragging = false;
  if (!evt.metaKey) {
    return;
  }

  if (evt.altKey) {
    const target = evt.target as HTMLElement;
    if (target.tagName !== 'TD') {
      return;
    }

    const side = target.id.replace(/.+([RL])\d+$/, '$1');
    const numberBoxes = Array.from(
      document.querySelectorAll<HTMLElement>(
        `.blob-num.selected-line[id*=${side}]`,
      ),
    );

    const file = findFile(numberBoxes[0]);
    file.markScrutinizedLines(numberBoxes);
  } else {
    const trs = Array.from(
      document.querySelectorAll('.blob-num.selected-line'),
    ).map((line) => line.closest('tr'));

    const file = findFile(trs[0]);
    file.markReviewedLines(trs, {updateUI: true});
  }
});

function updateToolbar() {
  const branchName = document.querySelector('.head-ref');
  if (!branchName) {
    return;
  }

  document.querySelector('.toolbar-branch-name')?.remove();

  const toolbarBranchName = document.createElement('span');
  toolbarBranchName.classList.add('toolbar-branch-name');
  toolbarBranchName.innerHTML = branchName.outerHTML;
  toolbarBranchName
    .querySelector('.css-truncate-target')
    .classList.remove('css-truncate-target');
  toolbarBranchName.addEventListener('click', (evt) => {
    navigator.clipboard.writeText(toolbarBranchName.innerText);
    evt.preventDefault();
  });

  const toolbarPRNumber = document.querySelector(
    '.pr-toolbar .gh-header-number, .gh-header .gh-header-number',
  );
  toolbarPRNumber.appendChild(toolbarBranchName);
}

updateToolbar();

(function defaltFilesTabToWhitespace() {
  const filesTab = document.querySelector('a.tabnav-tab[href$=files]') as
    | HTMLAnchorElement
    | undefined;
  if (filesTab) {
    filesTab.href += '?w=1';
  }
})();

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
      const addedFiles = Array.from(addedNodes).filter((element: HTMLElement) =>
        element.classList?.contains('js-file'),
      );
      addedFiles.forEach((addedFile) => {
        initializeFile(addedFile as HTMLElement);
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
  if (!isFilesView()) {
    return;
  }
  for (const fileElement of document.querySelectorAll('.js-file')) {
    initializeFile(fileElement as HTMLElement);
  }

  initializeFilesTab();
});

tabObserver.observe(document.querySelector('main'), {
  childList: true,
  subtree: false,
});

for (const fileElement of document.querySelectorAll('.js-file')) {
  initializeFile(fileElement as HTMLElement);
}

initializeFilesTab();
