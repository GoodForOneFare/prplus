import type {DiffType} from 'app/types';

import type {FileMetadata} from './file';
import {filesListener} from './files-listener';
import {tabsListener} from './tabs-listener';

export interface FilesListener {
  addedFiles(addedFiles: FileMetadata[]): void;
  cleared(): void;
}

export type TabType = 'Conversation' | 'Commits' | 'Checks' | 'Files';

export interface TabsListener {
  (tabType: TabType): void;
}

export class GithubUI {
  private _files: FileMetadata[] = [];
  private filesListeners: FilesListener[] = [];
  private tabsListeners: TabsListener[] = [];

  constructor() {}

  initialize() {
    tabsListener(() => {
      const {currentTab} = this;
      this.tabsListeners.forEach((listener) => listener(currentTab));
    });

    filesListener({
      addedCallback: (newFiles) => {
        this._files.push(...newFiles);
        this.filesListeners.forEach((listener) =>
          listener.addedFiles(newFiles),
        );
      },
      clearedCallback: () => {
        this._files.length = 0;
      },
    });
  }

  get files(): FileMetadata[] {
    return this._files;
  }

  getFileByPath(path: string) {
    return this.files.find((file) => file.path === path);
  }

  addTabsListener(listener: TabsListener) {
    this.tabsListeners.push(listener);
    listener(this.currentTab);
  }

  addFilesListener(listener: FilesListener) {
    this.filesListeners.push(listener);
    listener.addedFiles(this._files);
  }

  addReviewLineListener(callback: (file: FileMetadata) => void) {
    let isDragging = false;
    document.addEventListener('mousedown', (evt) => {
      if (!evt.metaKey) {
        return;
      }
      const target = evt.target as HTMLElement;
      isDragging =
        target.tagName === 'TD' && target.classList.contains('blob-num');
    });

    document.addEventListener('mouseup', (evt) => {
      if (!isDragging) {
        return;
      }

      isDragging = false;
      if (!evt.metaKey) {
        return;
      }

      const firstLine = document.querySelector<HTMLElement>(
        '.blob-num.selected-line:not(.empty-cell)',
      );
      if (!firstLine) {
        return;
      }

      const fileElement = firstLine.closest('.js-file');
      const file = this.files.find((file) => file.element === fileElement);
      if (!file) {
        return;
      }

      callback(file);
    });
  }

  get currentTab(): TabType {
    const pathname = window.location.pathname;
    if (pathname.endsWith('/files')) {
      return 'Files';
    } else if (pathname.endsWith('/checks')) {
      return 'Checks';
    } else if (pathname.endsWith('/commits')) {
      return 'Commits';
    } else {
      return 'Conversation';
    }
  }

  get currentFile(): FileMetadata | undefined {
    return this.files.find((file) => {
      if (file) {
        if (file.isExpanded && !file.isHidden) {
          return file.header.getBoundingClientRect().y >= 60;
        }
      }
      return false;
    });
  }

  get branchName(): string | undefined {
    return document.querySelector<HTMLElement>('.head-ref')?.innerText;
  }

  get diffType(): DiffType {
    const selectedDiffRadio = document.querySelector<HTMLInputElement>(
      'input[name=diff][checked]',
    );
    return (selectedDiffRadio?.value as DiffType) ?? 'split';
  }

  hideComments() {
    document.body.classList.add('__prs_hide_comments');
  }

  get prId() {
    const pathname = window.location.pathname;
    return pathname.match(/[/]pull[/]\d+/)
      ? pathname.replace(/(.+[/]pull[/]\d+).*/, '$1')
      : undefined;
  }

  showComments() {
    document.body.classList.remove('__prs_hide_comments');
  }

  switchToSplitDiff() {
    const checkbox = document.querySelector<HTMLInputElement>(
      'input[type=radio][name=diff][value=split]:not([checked])',
    );
    if (checkbox) {
      checkbox.checked = true;
      const whitespaceButton = document.querySelector<HTMLElement>(
        '#whitespace-cb ~ button',
      );
      whitespaceButton?.click();
    }
  }

  switchToUnifiedDiff() {
    const checkbox = document.querySelector<HTMLInputElement>(
      'input[type=radio][name=diff][value=unified]:not([checked])',
    );
    if (checkbox) {
      checkbox.checked = true;
      const whitespaceButton = document.querySelector<HTMLElement>(
        '#whitespace-cb ~ button',
      );
      whitespaceButton?.click();
    }
  }

  toggleWhitespace() {
    const [checkbox, submit] = document.querySelectorAll<HTMLInputElement>(
      '#whitespace-cb, #whitespace-cb ~ button',
    );
    checkbox.checked = true;
    submit.click();
  }
}
