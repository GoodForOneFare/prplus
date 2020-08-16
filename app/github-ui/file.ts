export interface FileMetadata {
  collapse(): void;
  expand(): void;
  hide(): void;
  loadLargeDiff(): void;
  show(): void;
  viewed(): void;
  element: HTMLElement;
  hasUnloadedDiff: boolean;
  header: HTMLElement;
  id: string;
  isDeleted: boolean;
  isExpanded: boolean;
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
    isRenamed:
      file.dataset.renamed !== undefined &&
      ['true', ''].includes(file.dataset.renamed!),
    get isExpanded() {
      return isExpanded();
    },
    get isViewed() {
      return isViewed();
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
