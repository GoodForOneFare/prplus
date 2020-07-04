import {findFile} from './file';

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
      const tr = target.closest('tr')!;
      findFile(tr).markReviewedLines([tr], {updateUI: true});
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

  const trs = Array.from(
    document.querySelectorAll('.blob-num.selected-line'),
  ).map((line) => line.closest<HTMLTableRowElement>('tr')!);

  const file = findFile(trs[0]!);
  file.markReviewedLines(trs, {updateUI: true});
});
