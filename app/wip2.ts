import {prs, ScrutinyBlock, ReviewLineSide} from './data';
import {findCurrentFile, isFilesView} from './dom-helpers';

interface TypeSummary {
  type: string;
  total: number;
  viewed: number;
  deleted: number;
  open: number;
}

type Summary = Record<string, TypeSummary>;

function aaa() {
  const facts = Array.from(document.querySelectorAll('.js-file .file-header'))
    .map((header: HTMLElement) => {
      const file = header.closest<HTMLElement>('.js-file');
      const type = /\b[/.]test/.test(header.dataset.path)
        ? 'test'
        : header.dataset.fileType
            .replace(/^[.]/, '')
            .replace(/([jt])sx$/, '$1s');

      return {
        type,
        viewed: file.dataset.fileUserViewed !== undefined,
        deleted: file.dataset.fileDeleted === 'true',
        open: file.classList.contains('open'),
      };
    })
    .sort((headerA, headerB) => {
      if (headerA.type < headerB.type) {
        return -1;
      } else if (headerA.type > headerB.type) {
        return 1;
      } else {
        return 0;
      }
    })
    .reduce((acc, {type, ...attrs}) => {
      if (!acc[type]) {
        acc[type] = {type, total: 0, viewed: 0, deleted: 0, open: 0};
      }
      ++acc[type].total;
      if (attrs.viewed) {
        ++acc[type].viewed;
      }
      if (attrs.deleted) {
        ++acc[type].deleted;
      }
      if (attrs.open) {
        ++acc[type].open;
      }

      return acc;
    }, {} as Summary);

  let factsHtml = document.querySelector('#facts');
  if (!factsHtml) {
    factsHtml = document.createElement('div');
    factsHtml.id = 'facts';
    const defaultProgressBar = document.querySelector<HTMLElement>(
      '.pr-review-tools .diffbar-item progress-bar',
    );
    if (defaultProgressBar) {
      defaultProgressBar.style.display = 'none';
      defaultProgressBar.parentElement.appendChild(factsHtml);
    }
  }
  factsHtml.innerHTML = Object.entries(facts)
    .map(([key, {viewed, total}]) => {
      return viewed === total ? `${key}: ✅` : `${key}: ${viewed} / ${total}`;
    })
    .join(', ');
}

document.body.removeEventListener('click', aaa);
document.body.addEventListener('click', () => {
  setTimeout(aaa, 500);
});

aaa();
initialScrutinizedLines();

function lineIds(trOrTd) {
  const {tagName} = trOrTd;
  const tr = tagName === 'tr' ? trOrTd : trOrTd.closest('tr');

  return Array.from(tr.querySelectorAll("[id^='diff-'")).map(({id}) => id);
}

function updateHeader(file) {
  const [additions, deletions, reviewedAdditions, reviewedDeletions] = [
    file.querySelectorAll('.blob-num-addition').length,
    file.querySelectorAll('.blob-num-deletion').length,
    file.querySelectorAll('.blob-num-addition.prs--reviewed').length,
    file.querySelectorAll('.blob-num-deletion.prs--reviewed').length,
  ];

  const container = file.querySelector('.file-header .file-actions');
  let progress = container.querySelector('.prs--review-progress');
  if (!progress) {
    container.style.display = 'flex';
    container.style.alignItems = 'center';

    progress = document.createElement('div');
    progress.classList.add('prs--review-progress');
    container.prepend(progress);
  }

  const addedProgress = additions
    ? `${Math.floor((reviewedAdditions / additions) * 100)}%`
    : '-';
  const deletionProgress = deletions
    ? `${Math.floor((reviewedDeletions / deletions) * 100)}%`
    : '-';
  progress.innerHTML = `
        ${addedProgress}, ${deletionProgress}
      `;
}

function markScrutinizedLines(numberBoxes: HTMLElement[]) {
  const prId = window.location.pathname.replace(/(.+[/]pull[/]\d+).*/, '$1');
  let pr = prs[prId];
  if (!pr) {
    pr = {files: {}};
    prs[prId] = pr;
  }

  const file = numberBoxes[0].closest('.js-file');
  const filePath = file.querySelector<HTMLElement>('.file-header').dataset.path;
  let fileInfo = pr.files[filePath];
  if (!fileInfo) {
    fileInfo = {lines: {}, scrutinyBlocks: []};
    pr.files[filePath] = fileInfo;
  }

  if (!fileInfo.scrutinyBlocks) {
    fileInfo.scrutinyBlocks = [];
  }

  const side = numberBoxes[0].id.replace(
    /.+([RL])\d+$/,
    '$1',
  ) as ReviewLineSide;
  const lineNumbers = Array.from(numberBoxes)
    .map(({id}) => id)
    .map((id) => id.replace(/.+[RL](\d+)$/, '$1'));
  const blockInfo = {filePath, side, lineNumbers};
  fileInfo.scrutinyBlocks.push(blockInfo);

  window.localStorage.__prs = JSON.stringify(prs);

  updateScrutinizedUI(blockInfo);
}

function updateScrutinizedUI(blockInfo: ScrutinyBlock) {
  const fileHeader = document.querySelector(
    `.js-file .file-header[data-path='${blockInfo.filePath}']`,
  );
  if (!fileHeader) {
    return;
  }

  const lineSelectors = blockInfo.lineNumbers
    .map((line) => `td[id$="${blockInfo.side}${line}"]`)
    .join(', ');
  const lineElements = Array.from(
    fileHeader.closest('.js-file').querySelectorAll(lineSelectors),
  );

  Array.from(lineElements).forEach((element) => {
    element.classList.add('__prs--scrutinize');
  });
  const firstBox = lineElements.shift();
  const lastBox = lineElements.pop() || firstBox;
  firstBox.classList.add('__prs--scrutinize--top');
  lastBox.classList.add('__prs--scrutinize--bottom');
}

function markReviewedLines(trs: HTMLElement[], options) {
  const prId = window.location.pathname.replace(/(.+[/]pull[/]\d+).*/, '$1');
  let pr = prs[prId];
  if (!pr) {
    pr = {files: {}};
    prs[prId] = pr;
  }

  const [firstTr] = trs;
  const file = firstTr.closest('.js-file');
  const filePath = file.querySelector<HTMLElement>('.file-header').dataset.path;
  let fileInfo = pr.files[filePath];
  if (!fileInfo) {
    fileInfo = {lines: {}};
    pr.files[filePath] = fileInfo;
  }

  const lines = fileInfo.lines;
  trs.forEach((tr) => {
    const reviewLineKey = lineIds(tr).join('-');
    lines[reviewLineKey] = true;

    if (options && options.updateUI) {
      Array.from(
        tr.querySelectorAll(
          '.blob-num-addition, .blob-code-addition, .blob-num-deletion, .blob-code-deletion',
        ),
      ).forEach((child) => {
        child.classList.add('prs--reviewed');
      });
    }
  });

  window.localStorage.__prs = JSON.stringify(prs);

  updateHeader(file);
}

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

      markReviewedLines([tr], {updateUI: true});
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

    // const codeLines = Array.from(document.querySelectorAll('.blob-code.selected-line'));

    markScrutinizedLines(numberBoxes);
  } else {
    const trs = Array.from(
      document.querySelectorAll('.blob-num.selected-line'),
    ).map((line) => line.closest('tr'));

    markReviewedLines(trs, {updateUI: true});
  }
});

function initialScrutinizedLines() {
  const prId = window.location.pathname.replace(/(.+[/]pull[/]\d+).*/, '$1');
  const pr = prs[prId];
  if (!pr) {
    return;
  }

  Object.values(pr.files).forEach((file) => {
    file.scrutinyBlocks?.forEach((scrutinyBlock) => {
      updateScrutinizedUI(scrutinyBlock);
    });
  });
}

function unhighlightReviewedLines() {
  const prId = window.location.pathname.replace(/(.+[/]pull[/]\d+).*/, '$1');
  const pr = prs[prId];
  if (!pr) {
    return;
  }

  Object.keys(pr.files).forEach((filePath) => {
    const fileHeader = document.querySelector(
      `.file-header[data-path="${filePath}"]`,
    );
    if (!fileHeader) {
      return;
    }
    const file = fileHeader.closest('.js-file');
    const fileInfo = pr.files[filePath];
    if (!fileInfo) {
      return;
    }

    const lines = fileInfo.lines;
    Array.from(
      file.querySelectorAll(
        '.blob-num-addition, .blob-code-addition, .blob-num-deletion, .blob-code-deletion',
      ),
    ).forEach((child) => {
      const tr = child.closest('tr');
      const reviewLineKey = lineIds(tr).join('-');

      if (lines[reviewLineKey] === true) {
        child.classList.add('prs--reviewed');
      }
    });
  });
}

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

function initializeFile(fileElement) {
  const header = fileElement.querySelector('.file-header');
  const filePath = header.dataset.path;
  if (filePath.match(/([/]tests?[/]|[/]fixtures[/]|\.tests?\.[jt]s)/)) {
    fileElement.dataset.test = true;
  }

  if (fileElement.querySelector('.js-file-content .data.empty')) {
    fileElement.dataset.renamed = true;
  }
}

function initializeFilesTab() {
  if (!isFilesView()) {
    return;
  }

  aaa();
  unhighlightReviewedLines();

  const filesObserver = new MutationObserver((mutationsList) => {
    mutationsList.forEach(({addedNodes}) => {
      const addedFiles = Array.from(addedNodes).filter((element: HTMLElement) =>
        element.classList?.contains('js-file'),
      );
      addedFiles.forEach((addedFile) => {
        initializeFile(addedFile);
      });
    });

    aaa();
    initialScrutinizedLines();
    unhighlightReviewedLines();
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
    initializeFile(fileElement);
  }

  initializeFilesTab();
});

tabObserver.observe(document.querySelector('main'), {
  childList: true,
  subtree: false,
});

for (const fileElement of document.querySelectorAll('.js-file')) {
  initializeFile(fileElement);
}

initializeFilesTab();
