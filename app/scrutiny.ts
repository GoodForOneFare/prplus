import {findCurrentFile} from './dom-helpers';
import {prs, ReviewLineSide, ScrutinyBlock} from './data';

export function clearCurrentFileScrutinyLines() {
  const fileElement = findCurrentFile();
  if (!fileElement) {
    return;
  }

  const prId = window.location.pathname.replace(/(.+[/]pull[/]\d+).*/, '$1');
  const pr = prs[prId];
  if (!pr) {
    return;
  }

  const filePath = fileElement.querySelector<HTMLElement>('.file-header')
    .dataset.path;
  if (pr.files[filePath]) {
    pr.files[filePath].scrutinyBlocks = [];
  }

  for (const reviewedElement of fileElement.querySelectorAll(
    '.__prs--scrutinize',
  )) {
    reviewedElement.classList.remove(
      '__prs--scrutinize',
      '__prs--scrutinize--top',
      '__prs--scrutinize--bottom',
    );
  }
  window.localStorage.__prs = JSON.stringify(prs);
}

export function markScrutinizedLines(numberBoxes: HTMLElement[]) {
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

export function updateScrutinizedUI(blockInfo: ScrutinyBlock) {
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

export function initialScrutinizedLines() {
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
