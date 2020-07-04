import {prs, getPrFileData, savePrData, ReviewLineSide} from './data';
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

  return file;
}

export function findCurrentFile() {
  const fileElement = findCurrentFileDOM();
  if (fileElement) {
    const headerElement = fileElement.querySelector<HTMLElement>(
      '.file-header',
    )!;
    const filePath = headerElement.dataset.path!;
    return files[filePath];
  }
  return null;
}

export function findFile(element: HTMLElement) {
  const header = element
    .closest('.js-file')!
    .querySelector<HTMLElement>('.file-header')!;

  return files[header.dataset.path!];
}

function lineIds(trOrTd: HTMLTableRowElement | HTMLTableCellElement) {
  const {tagName} = trOrTd;
  const tr = tagName === 'tr' ? trOrTd : trOrTd.closest('tr')!;

  return Array.from(tr.querySelectorAll("[id^='diff-'")).map(({id}) => id);
}

class File {
  readonly _path: string;
  readonly isTest: boolean;
  private readonly header: HTMLElement;

  constructor(private readonly fileElement: HTMLElement) {
    this.header = fileElement.querySelector<HTMLElement>('.file-header')!;
    this._path = this.header.dataset.path!;

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
    this.header.querySelector<HTMLElement>('.js-reviewed-checkbox')?.click();
  }

  markReviewedLines(trs: HTMLTableRowElement[], options: {updateUI?: boolean}) {
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
      const tr = child.closest<HTMLTableRowElement>('tr')!;
      const reviewLineKey = lineIds(tr).join('-');

      if (lines[reviewLineKey] === true) {
        child.classList.add('prs--reviewed');
      }
    });
  }
}
