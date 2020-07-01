import {
  prs,
  getPrFileData,
  savePrData,
  ScrutinyBlock,
  ReviewLineSide,
} from './data';
import {findCurrentFile as findCurrentFileDOM} from './dom-helpers';

const prId = window.location.pathname.replace(/(.+[/]pull[/]\d+).*/, '$1');
let pr = prs[prId];
if (!pr) {
  pr = {files: {}};
  prs[prId] = pr;
}

const files: Record<string, File> = {};

export function initializeFile(fileElement: HTMLElement) {
  const file = new File(fileElement);
  files[file.path] = file;

  if (file.isTest) {
    fileElement.dataset.test = 'true';
  }

  if (fileElement.querySelector('.js-file-content .data.empty')) {
    fileElement.dataset.renamed = 'true';
  }

  file.unhighlightReviewedLines();
  file.initialScrutinizedLines();

  return file;
}

export function findCurrentFile() {
  const fileElement = findCurrentFileDOM();
  console.log('@@findCurrentFile', fileElement);
  console.log('@@findCurrentFile', files);
  return files[
    fileElement.querySelector<HTMLElement>('.file-header').dataset.path
  ];
}

export function findFile(element: HTMLElement) {
  const header = element
    .closest('.js-file')
    .querySelector<HTMLElement>('.file-header');
  console.log('@@files', files);
  console.log('@@filePath', header.dataset.path);
  return files[header.dataset.path];
}

function lineIds(trOrTd) {
  const {tagName} = trOrTd;
  const tr = tagName === 'tr' ? trOrTd : trOrTd.closest('tr');

  return Array.from(tr.querySelectorAll("[id^='diff-'")).map(({id}) => id);
}

export class File {
  readonly _path: string;
  readonly isTest: boolean;
  private readonly header: HTMLElement;

  constructor(private readonly fileElement: HTMLElement) {
    this.header = fileElement.querySelector<HTMLElement>('.file-header');
    this._path = this.header.dataset.path;

    this.isTest = Boolean(
      this._path.match(/([/]tests?[/]|[/]fixtures[/]|\.tests?\.[jt]s)/),
    );
  }

  get path() {
    return this._path;
  }

  clearReviewedLines() {
    const fileInfo = getPrFileData({prId, filePath: this.path});
    if (fileInfo) {
      fileInfo.lines = {};
      savePrData();
    }

    for (const reviewedElement of this.fileElement.querySelectorAll(
      '.prs--reviewed',
    )) {
      reviewedElement.classList.remove('prs--reviewed');
    }
  }

  markAsViewed() {
    this.header.querySelector<HTMLElement>('.js-reviewed-checkbox').click();
  }

  markReviewedLines(trs: HTMLElement[], options: {updateUI?: boolean}) {
    const fileInfo = getPrFileData({prId, filePath: this.path});
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

    savePrData();
  }

  unhighlightReviewedLines() {
    const fileInfo = getPrFileData({prId, filePath: this.path});
    if (!fileInfo) {
      return;
    }

    const lines = fileInfo.lines;
    Array.from(
      this.fileElement.querySelectorAll(
        '.blob-num-addition, .blob-code-addition, .blob-num-deletion, .blob-code-deletion',
      ),
    ).forEach((child) => {
      const tr = child.closest('tr');
      const reviewLineKey = lineIds(tr).join('-');

      if (lines[reviewLineKey] === true) {
        child.classList.add('prs--reviewed');
      }
    });
  }

  clearScrutinyLines() {
    const fileInfo = getPrFileData({prId, filePath: this.path});
    fileInfo.scrutinyBlocks = [];
    savePrData();

    for (const reviewedElement of this.fileElement.querySelectorAll(
      '.__prs--scrutinize',
    )) {
      reviewedElement.classList.remove(
        '__prs--scrutinize',
        '__prs--scrutinize--top',
        '__prs--scrutinize--bottom',
      );
    }
  }

  markScrutinizedLines(numberBoxes: HTMLElement[]) {
    const fileInfo = getPrFileData({prId, filePath: this.path});

    const side = numberBoxes[0].id.replace(
      /.+([RL])\d+$/,
      '$1',
    ) as ReviewLineSide;
    const lineNumbers = Array.from(numberBoxes)
      .map(({id}) => id)
      .map((id) => id.replace(/.+[RL](\d+)$/, '$1'));

    const blockInfo = {filePath: this.path, side, lineNumbers};
    fileInfo.scrutinyBlocks.push(blockInfo);
    savePrData();

    this.updateScrutinizedUI(blockInfo);
  }

  updateScrutinizedUI(blockInfo: ScrutinyBlock) {
    const lineSelectors = blockInfo.lineNumbers
      .map((line) => `td[id$="${blockInfo.side}${line}"]`)
      .join(', ');
    const lineElements = Array.from(
      this.fileElement.querySelectorAll(lineSelectors),
    );

    Array.from(lineElements).forEach((element) => {
      element.classList.add('__prs--scrutinize');
    });
    const firstBox = lineElements.shift();
    const lastBox = lineElements.pop() || firstBox;
    firstBox.classList.add('__prs--scrutinize--top');
    lastBox.classList.add('__prs--scrutinize--bottom');
  }

  initialScrutinizedLines() {
    const fileInfo = getPrFileData({prId, filePath: this.path});

    fileInfo.scrutinyBlocks?.forEach((scrutinyBlock) => {
      this.updateScrutinizedUI(scrutinyBlock);
    });
  }
}

export function updateHeader(file) {
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
