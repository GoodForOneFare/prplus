import {findCurrentFile} from './dom-helpers';
import {prs} from './data';

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

export function clearCurrentFileReviewedLines() {
  const currentStickyHeader = findCurrentFile();
  if (!currentStickyHeader) {
    return;
  }

  const prId = window.location.pathname.replace(/(.+[/]pull[/]\d+).*/, '$1');
  const pr = prs[prId];
  if (!pr) {
    return;
  }

  const filePath = currentStickyHeader.dataset.path;
  if (pr.files[filePath]) {
    pr.files[filePath].lines = {};
  }

  const fileElement = currentStickyHeader.closest('.file');
  for (const reviewedElement of fileElement.querySelectorAll(
    '.prs--reviewed',
  )) {
    reviewedElement.classList.remove('prs--reviewed');
  }
  window.localStorage.__prs = JSON.stringify(prs);
}
