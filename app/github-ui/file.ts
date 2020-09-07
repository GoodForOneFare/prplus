import {ReviewLines} from '../types';

export interface FileMetadata {
  clearReviewedLines(lines: ReviewLines): void;
  collapse(): void;
  expand(): void;
  hide(): void;
  loadLargeDiff(): void;
  show(): void;
  viewed(): void;
  element: HTMLElement;
  getSelectedLines(): ReviewLines;
  hasUnloadedDiff: boolean;
  header: HTMLElement;
  highlightReviewLines(lines: ReviewLines): void;
  id: string;
  isDeleted: boolean;
  isExpanded: boolean;
  isHidden: boolean;
  isRenamed: boolean;
  isViewed: boolean;
  path: string;
}

export function fileMetadata(file: HTMLElement): FileMetadata {
  const header = file.querySelector<HTMLElement>('.file-header')!;
  function isExpanded() {
    return file.classList.contains('open');
  }

  function isViewed() {
    return (
      file.dataset.fileUserViewed !== undefined &&
      ['true', ''].includes(file.dataset.fileUserViewed)
    );
  }

  function largeDiffLoader() {
    return file.querySelector<HTMLElement>(
      '.js-diff-load-container [data-hide-on-error] button',
    );
  }

  return {
    id: file.id,
    element: file,
    header,
    path: header.dataset.path!,
    get hasUnloadedDiff() {
      return Boolean(largeDiffLoader());
    },
    isDeleted: file.dataset.fileDeleted === 'true',
    get isRenamed() {
      return (
        file.querySelector<HTMLElement>('.js-file-content')?.innerText ===
        'File renamed without changes.'
      );
    },
    get isExpanded() {
      return isExpanded();
    },
    get isHidden() {
      return file.dataset.hidden === 'true';
    },
    get isViewed() {
      return isViewed();
    },
    clearReviewedLines(lines) {
      const lineIds = Object.keys(lines);
      if (lineIds.length === 0) {
        return;
      }

      const lineSelectors = lineIds
        .map((id) => `[id$=${id}], [id$=${id}] + .blob-code`)
        .join(', ');

      Array.from(
        this.element.querySelectorAll<HTMLElement>(lineSelectors),
      ).forEach((lineElement) => {
        lineElement.style.background = '';
      });
    },
    collapse() {
      if (isExpanded()) {
        file.querySelector<HTMLInputElement>('[aria-expanded]')?.click();
      }
    },
    expand() {
      if (!isExpanded()) {
        file.querySelector<HTMLInputElement>('[aria-expanded]')?.click();
      }
    },
    hide() {
      file.dataset.hidden = 'true';
    },
    highlightReviewLines(lines) {
      const lineIds = Object.keys(lines);
      if (lineIds.length === 0) {
        return;
      }

      const numberSelectors = lineIds
        .map((lineId) => `[id$=${lineId}]`)
        .join(', ');
      const codeSelectors = lineIds
        .map((lineId) => `[id$=${lineId}] + .blob-code`)
        .join(', ');

      const numberElements = Array.from(
        this.element.querySelectorAll<HTMLElement>(numberSelectors),
      );
      const codeElements = Array.from(
        this.element.querySelectorAll<HTMLElement>(codeSelectors),
      );

      const domLines = numberElements.reduce((acc, numberElement, index) => {
        const lineId = numberElement.id.replace(/.+((R|L)\d+)$/, '$1');
        const codeElement = codeElements[index];
        const lineCode = codeElement.innerText;
        return [...acc, {lineId, code: lineCode, numberElement, codeElement}];
      }, [] as {lineId: string; code: string; numberElement: HTMLElement; codeElement: HTMLElement}[]);

      const matchingLines = domLines.filter(
        ({lineId, code}) => lines[lineId] === code,
      );

      matchingLines.forEach(({numberElement, codeElement}) => {
        numberElement.style.background = 'none';
        codeElement.style.background = 'none';
      });
    },
    getSelectedLines() {
      const firstLine = document.querySelector<HTMLElement>(
        '.blob-num.selected-line:not(.empty-cell)',
      );
      if (!firstLine) {
        return {};
      }

      const side = firstLine.classList.contains('blob-num-deletion')
        ? 'L'
        : 'R';
      const sideSelector =
        side === 'L' ? 'blob-num-deletion' : 'blob-num-addition';

      const lineIds = Array.from(
        document.querySelectorAll<HTMLElement>(
          `.selected-line.${sideSelector}.blob-num:not(.empty-cell)`,
        ),
      ).map((line) => line.id.replace(new RegExp(`.+(${side}\\d+)$`), '$1'));
      const codeLines = Array.from(
        document.querySelectorAll<HTMLElement>(
          `.selected-line.${sideSelector}.blob-num:not(.empty-cell) ~ .blob-code`,
        ),
      ).map((line) => line.innerText);

      return lineIds.reduce(
        (acc, id, index) => ({...acc, [id]: codeLines[index]}),
        {} as ReviewLines,
      );
    },
    loadLargeDiff() {
      return largeDiffLoader()?.click();
    },
    show() {
      delete file.dataset.hidden;
    },
    viewed() {
      const checkbox = file.querySelector<HTMLInputElement>(
        '.js-reviewed-checkbox',
      );
      if (checkbox && !checkbox.checked) {
        checkbox.click();
      }
    },
  };
}
