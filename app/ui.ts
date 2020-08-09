/* global __webpack_public_path__:true */
/* env webextensions */
import 'regenerator-runtime';
import {render} from 'react-dom';
import {createElement} from 'react';

import {Command} from './types';

// Async chunk loading requires a plugin-relative base path.
// @ts-expect-error
// eslint-disable-next-line @typescript-eslint/camelcase
__webpack_public_path__ = chrome.runtime.getURL('');

function isFilesView() {
  return window.location.pathname.endsWith('/files');
}

function tabsListener(tabChangeCallback: (isFilesView: boolean) => void) {
  const tabObserver = new MutationObserver(() => {
    tabChangeCallback(isFilesView());
  });

  tabObserver.observe(document.querySelector('main')!, {
    childList: true,
    subtree: false,
  });

  tabChangeCallback(isFilesView());
}

function filesListener({
  addedCallback,
  clearedCallback,
}: {
  addedCallback: (files: FileMetadata[]) => void;
  clearedCallback: () => void;
}) {
  const filesObserver = new MutationObserver((mutationsList) => {
    mutationsList.forEach(({addedNodes}) => {
      if (addedNodes.length === 0) {
        // Ignore the loading spinner being removed.
        return;
      }

      const addedFiles = Array.from(addedNodes)
        .filter(
          (element): element is HTMLElement => element instanceof HTMLElement,
        )
        .filter((element) => element.classList?.contains('js-file'));

      const addedInfo = addedFiles.map(fileMetadata);
      addedCallback(addedInfo);
    });
  });

  tabsListener((isFilesView) => {
    if (isFilesView) {
      const initialFiles = Array.from(
        document.querySelectorAll<HTMLElement>('.js-file'),
      );

      addedCallback(initialFiles.map(fileMetadata));

      const fileContainers = Array.from(
        document.querySelectorAll('#files .js-diff-progressive-container'),
      );

      for (const filesContainer of fileContainers) {
        filesObserver.observe(filesContainer, {
          attributes: false,
          characterData: false,
          characterDataOldValue: false,
          childList: true,
          subtree: false,
        });
      }
    } else {
      clearedCallback();
      filesObserver.disconnect();
    }
  });
}

function findCurrentFileDOM() {
  const header = Array.from(
    document.querySelectorAll<HTMLElement>(
      '.js-file:not([data-file-user-viewed]) .file-header',
    ),
  ).find((header) => header.getBoundingClientRect().y >= 60);

  return header ? header.closest('.js-file') : null;
}

function findCurrentFile() {
  const fileElement = findCurrentFileDOM();
  if (fileElement) {
    const headerElement = fileElement.querySelector<HTMLElement>(
      '.file-header',
    )!;
    const filePath = headerElement.dataset.path!;
    return files.find((aFile) => aFile.path === filePath);
  }
  return null;
}

interface FileMetadata {
  id: string;
  path: string;
  element: HTMLElement;
  hasUnloadedDiff: boolean;
  header: HTMLElement;
  isDeleted: boolean;
  isRenamed: boolean;
  isViewed: boolean;
  isExpanded: boolean;
  dom: {
    collapse(): void;
    expand(): void;
    hide(): void;
    loadLargeDiff(): void;
    show(): void;
    viewed(): void;
  };
}

function fileMetadata(file: HTMLElement): FileMetadata {
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
    isDeleted: file.dataset.fileDeleted === 'false',
    isRenamed:
      file.dataset.renamed !== undefined &&
      ['true', ''].includes(file.dataset.renamed!),
    get isExpanded() {
      return isExpanded();
    },
    get isViewed() {
      return isViewed();
    },
    dom: {
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
        file.querySelector<HTMLElement>('.js-reviewed-checkbox')?.click();
      },
    },
  };
}

const files: FileMetadata[] = [];
type FileType =
  | 'css'
  | 'data'
  | 'deleted'
  | 'graphql'
  | 'image'
  | 'javascript'
  | 'renamed'
  | 'sass'
  | 'style'
  | 'svg'
  | 'json'
  | 'test'
  | 'typescript'
  | 'viewed'
  | 'yml';

type FileFilter = (file: FileMetadata) => boolean;
const fileFilters: Record<FileType, FileFilter> = {
  css: (file) => /[.]css$/.test(file.path),
  data: (file) => /[.](json|yml)?$/.test(file.path),
  deleted: (file) => file.isDeleted,
  graphql: (file) => /[.](graphql|gql)$/.test(file.path),
  image: (file) => /[.](gif|jpe?g|png|svg)?$/.test(file.path),
  javascript: (file) => /\.jsx?$/.test(file.path),
  typescript: (file) => /\.tsx?$/.test(file.path),
  json: (file) => file.path.endsWith('.json'),
  renamed: (file) => file.isRenamed,
  sass: (file) => /[.]scss$/.test(file.path),
  style: (file) => /[.]s?css$/.test(file.path),
  svg: (file) => file.path.endsWith('.svg'),
  test: (file) =>
    /\.test\.[jt]sx?$/.test(file.path) ||
    /[/]tests?[/]/.test(file.path) ||
    /_tests?\.rb/.test(file.path),
  viewed: (file) => file.isViewed,
  yml: (file) => /[.]yml?$/.test(file.path),
};

const filterNames: Record<FileType, Command['text']> = {
  css: 'CSS',
  data: 'data',
  deleted: 'deleted',
  graphql: 'GraphQL',
  image: 'image',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  json: 'JSON',
  renamed: 'renamed',
  sass: 'Sass',
  style: 'style',
  svg: 'SVG',
  test: 'test',
  viewed: 'viewed',
  yml: 'YML',
};

let activeFilters: FileFilter[] = [];

function activateFileFilter(filter: (file: FileMetadata) => boolean) {
  activeFilters.push(filter);
  hideFiles();
}

function showFiles(filter: FileFilter) {
  files.filter(filter).forEach((file) => {
    file.dom.show();
  });
}

function deactivateFileFilter(filter: (file: FileMetadata) => boolean) {
  activeFilters = activeFilters.filter((aFilter) => aFilter !== filter);
  showFiles(filter);
}

function hideFiles() {
  const hiddenFiles = activeFilters.reduce((acc, filter) => {
    files.filter(filter).forEach((hiddenFile) => acc.add(hiddenFile));
    return acc;
  }, new Set<FileMetadata>());

  hiddenFiles.forEach((file) => {
    file.dom.hide();
  });
}

filesListener({
  addedCallback: (newFiles) => {
    files.push(...newFiles);
    hideFiles();
  },
  clearedCallback: () => {
    files.length = 0;
  },
});

function hideComments() {
  document.body.classList.add('__prs_hide_comments');
}

function showComments() {
  document.body.classList.remove('__prs_hide_comments');
}

function toggleWhitespace() {
  const [checkbox, submit] = document.querySelectorAll<HTMLInputElement>(
    '#whitespace-cb, #whitespace-cb ~ button',
  );
  checkbox.checked = true;
  submit.click();
}

function switchToSplitDiff() {
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

function switchToUnifiedDiff() {
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

function generateCommands(): Command[] {
  return [
    ...Object.entries(fileFilters)
      .map(([key, filter]) => {
        const text = filterNames[key as FileType];

        return [
          {
            text: `Collapse ${text} files`,
            callback() {
              files.filter(filter).forEach((file) => file.dom.collapse());
            },
          },
          {
            text: `Expand ${text} files`,
            callback() {
              files.filter(filter).forEach((file) => file.dom.expand());
            },
          },
          {
            text: `Hide ${text} files`,
            callback: () => activateFileFilter(filter),
          },
          {
            text: `Show ${text} files`,
            callback: () => deactivateFileFilter(filter),
          },
          {
            text: `Mark ${text} files as viewed`,
            callback() {
              files.filter(filter).forEach((file) => {
                file.dom.viewed();
              });
            },
          },
        ];
      })
      .flat(),
    {
      text(filterText: string) {
        return /^Collapse /i.test(filterText)
          ? `Collapse ${filterText.replace(/^Collapse /i, '')} files`
          : '';
      },
      callback(filterText: string) {
        const regex = new RegExp(filterText);
        files
          .filter((file) => regex.test(file.path))
          .forEach((file) => file.dom.collapse());
      },
    },
    {
      text(filterText: string) {
        return /^Expand /i.test(filterText)
          ? `Expand ${filterText.replace(/^Expand /i, '')} files`
          : '';
      },
      callback(filterText: string) {
        const regex = new RegExp(filterText);
        files
          .filter((file) => regex.test(file.path))
          .forEach((file) => file.dom.expand());
      },
    },
    {
      text(filterText: string) {
        return /^Hide /i.test(filterText)
          ? `Hide ${filterText.replace(/^Hide /i, '')} files`
          : '';
      },
      callback(filterText: string) {
        const regex = new RegExp(
          filterText.replace(/^Hide (.+)( files)?$/i, '$1'),
          'i',
        );

        files
          .filter((file) => regex.test(file.path))
          .forEach((file) => file.dom.hide());
      },
    },
    {
      text(filterText: string) {
        return /^Show /i.test(filterText)
          ? `Show ${filterText.replace(/^Show /i, '')} files`
          : '';
      },
      callback(filterText: string) {
        const regex = new RegExp(filterText);
        files
          .filter((file) => regex.test(file.path))
          .forEach((file) => file.dom.show());
      },
    },
    {
      text(filterText: string) {
        return /^Mark /i.test(filterText)
          ? `Mark ${filterText.replace(/^Mark /i, '')} files as viewed`
          : '';
      },
      callback(filterText: string) {
        const regex = new RegExp(filterText);
        files
          .filter((file) => regex.test(file.path))
          .forEach((file) => file.dom.viewed());
      },
    },
    {
      text: 'Collapse all',
      callback() {
        files.forEach((file) => {
          file.dom.collapse();
        });
      },
    },
    {
      text: 'Expand all',
      callback() {
        files.forEach((file) => {
          file.dom.expand();
        });
      },
    },
    {
      text: 'Current file: mark as viewed',
      callback: () => findCurrentFile()?.dom.viewed(),
    },
    {
      text: `Toggle whitespace`,
      callback: () => toggleWhitespace(),
    },
    {
      text: 'Switch to unified diff',
      callback: () => switchToUnifiedDiff(),
    },
    {
      text: 'Switch to split diff',
      callback() {
        switchToSplitDiff();
      },
    },
    {text: 'Hide comments', callback: () => hideComments()},
    {text: 'Show comments', callback: () => showComments()},
    {
      text: 'Load large diffs',
      callback() {
        files.filter((file) => file.dom.loadLargeDiff());
      },
    },
  ].sort();
}

(function initializeCommandPalette() {
  requestAnimationFrame(async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const Container = (
      await import(/* webpackChunkName: "react-ui" */ './components')
    ).Container;

    requestAnimationFrame(() => {
      render(
        createElement(Container, {
          commands: generateCommands(),
        }),
        container,
      );
    });
  });
})();
