import {FileMetadata} from './file';
import {filesListener} from './files-listener';
import {tabsListener} from './tabs-listener';

function findCurrentFileDOM() {
  const header = Array.from(
    document.querySelectorAll<HTMLElement>(
      '.js-file:not([data-file-user-viewed]) .file-header',
    ),
  ).find((header) => header.getBoundingClientRect().y >= 60);

  return header ? header.closest('.js-file') : null;
}

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
      },
      clearedCallback: () => {
        this._files.length = 0;
      },
    });
  }

  get files(): FileMetadata[] {
    return this._files;
  }

  addTabsListener(listener: TabsListener) {
    this.tabsListeners.push(listener);
    listener(this.currentTab);
  }

  addFilesListener(listener: FilesListener) {
    this.filesListeners.push(listener);
    listener.addedFiles(this._files);
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
    const fileElement = findCurrentFileDOM();
    if (fileElement) {
      const headerElement = fileElement.querySelector<HTMLElement>(
        '.file-header',
      )!;
      const filePath = headerElement.dataset.path!;
      return this._files.find((aFile) => aFile.path === filePath);
    }
    return undefined;
  }

  hideComments() {
    document.body.classList.add('__prs_hide_comments');
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
