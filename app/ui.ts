/* global __webpack_public_path__:true */
/* env webextensions */
import 'regenerator-runtime';
import {render} from 'react-dom';
import {createElement} from 'react';

import {Command} from './types';
import {FileMetadata} from './github-ui/file';
import {GithubUI} from './github-ui';

// Async chunk loading requires a plugin-relative base path.
// @ts-expect-error
// eslint-disable-next-line @typescript-eslint/camelcase
__webpack_public_path__ = chrome.runtime.getURL('');

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
  githubUI.files.filter(filter).forEach((file) => {
    file.dom.show();
  });
}

function deactivateFileFilter(filter: (file: FileMetadata) => boolean) {
  activeFilters = activeFilters.filter((aFilter) => aFilter !== filter);
  showFiles(filter);
}

function hideFiles() {
  const hiddenFiles = activeFilters.reduce((acc, filter) => {
    githubUI.files.filter(filter).forEach((hiddenFile) => acc.add(hiddenFile));
    return acc;
  }, new Set<FileMetadata>());

  hiddenFiles.forEach((file) => {
    file.dom.hide();
  });
}

const githubUI = new GithubUI();
githubUI.initialize();
githubUI.addFilesListener({
  addedFiles() {
    hideFiles();
  },
  cleared() {},
});

function generateCommands(): Command[] {
  return [
    ...Object.entries(fileFilters)
      .map(([key, filter]) => {
        const text = filterNames[key as FileType];

        return [
          {
            text: `Collapse ${text} files`,
            callback() {
              githubUI.files
                .filter(filter)
                .forEach((file) => file.dom.collapse());
            },
          },
          {
            text: `Expand ${text} files`,
            callback() {
              githubUI.files
                .filter(filter)
                .forEach((file) => file.dom.expand());
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
              githubUI.files.filter(filter).forEach((file) => {
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
        githubUI.files
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
        githubUI.files
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

        githubUI.files
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
        githubUI.files
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
        githubUI.files
          .filter((file) => regex.test(file.path))
          .forEach((file) => file.dom.viewed());
      },
    },
    {
      text: 'Collapse all',
      callback() {
        githubUI.files.forEach((file) => {
          file.dom.collapse();
        });
      },
    },
    {
      text: 'Expand all',
      callback() {
        githubUI.files.forEach((file) => {
          file.dom.expand();
        });
      },
    },
    {
      text: 'Current file: mark as viewed',
      callback: () => githubUI.currentFile?.dom.viewed(),
    },
    {
      text: `Toggle whitespace`,
      callback: () => githubUI.toggleWhitespace(),
    },
    {
      text: 'Switch to unified diff',
      callback: () => githubUI.switchToUnifiedDiff(),
    },
    {
      text: 'Switch to split diff',
      callback() {
        githubUI.switchToSplitDiff();
      },
    },
    {text: 'Hide comments', callback: () => githubUI.hideComments()},
    {text: 'Show comments', callback: () => githubUI.showComments()},
    {
      text: 'Load large diffs',
      callback() {
        githubUI.files.filter((file) => file.dom.loadLargeDiff());
      },
    },
  ].sort();
}

(function initializeCommandPalette() {
  requestIdleCallback(async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const Container = (
      await import(/* webpackChunkName: "react-ui" */ './components')
    ).Container;

    requestIdleCallback(() => {
      render(
        createElement(Container, {
          commands: generateCommands(),
        }),
        container,
      );
    });
  });
})();
