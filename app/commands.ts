import {FilterManager} from './filter-manager';
import {GithubUI} from './github-ui';
import type {Command, FileType} from './types';
import {FileMetadata} from './github-ui/file';

export function generateCommands(
  githubUI: GithubUI,
  clearReviewLines: (file: FileMetadata) => void,
  filterManager: FilterManager,
): Command[] {
  return [
    ...Object.entries(filterManager.allFilters)
      .map(([key, filter]) => {
        const text =
          typeof filter.text === 'string' ? filter.text : filter.text('');

        return [
          {
            text: `Collapse ${text} files`,
            callback() {
              githubUI.files
                .filter(filter.filter)
                .forEach((file) => file.collapse());
            },
          },
          {
            text: `Expand ${text} files`,
            callback() {
              githubUI.files
                .filter(filter.filter)
                .forEach((file) => file.expand());
            },
          },
          {
            text: `Hide ${text} files`,
            callback: () => {
              filterManager.activateFilter(key as FileType);
              filterManager
                .filesFor(githubUI.files, key as FileType)
                .forEach((file) => file.hide());
            },
          },
          {
            text: `Show ${text} files`,
            callback: () => {
              filterManager.deactivateFilter(key as FileType);
              filterManager
                .filesFor(githubUI.files, key as FileType)
                .forEach((file) => file.show());
            },
          },
          {
            text: `Mark ${text} files as viewed`,
            callback() {
              githubUI.files.filter(filter.filter).forEach((file) => {
                file.viewed();
              });
            },
          },
        ];
      })
      .flat(),
    {
      text(filterText: string) {
        return /^Collapse /i.test(filterText)
          ? `Collapse /${filterText.replace(/^Collapse /i, '')}/ files`
          : '';
      },
      callback(filterText: string) {
        const regex = new RegExp(
          filterText.replace(/^Collapse (.+)( files)?$/i, '$1'),
          'i',
        );

        githubUI.files
          .filter((file) => regex.test(file.path))
          .forEach((file) => file.collapse());
      },
    },
    {
      text(filterText: string) {
        return /^Expand /i.test(filterText)
          ? `Expand /${filterText.replace(/^Expand /i, '')}/ files`
          : '';
      },
      callback(filterText: string) {
        const regex = new RegExp(
          filterText.replace(/^Expand (.+)( files)?$/i, '$1'),
          'i',
        );

        githubUI.files
          .filter((file) => regex.test(file.path))
          .forEach((file) => file.expand());
      },
    },
    {
      text(filterText: string) {
        return /^Hide /i.test(filterText)
          ? `Hide /${filterText.replace(/^Hide /i, '')}/ files`
          : '';
      },
      callback(filterText: string) {
        const regex = new RegExp(
          filterText.replace(/^Hide (.+)( files)?$/i, '$1'),
          'i',
        );

        githubUI.files
          .filter((file) => regex.test(file.path))
          .forEach((file) => file.hide());
      },
    },
    {
      text(filterText: string) {
        return /^Show /i.test(filterText)
          ? `Show /${filterText.replace(/^Show /i, '')}/ files`
          : '';
      },
      callback(filterText: string) {
        const regex = new RegExp(
          filterText.replace(/^Show (.+)( files)?$/i, '$1'),
          'i',
        );

        githubUI.files
          .filter((file) => regex.test(file.path))
          .forEach((file) => file.show());
      },
    },
    {
      text(filterText: string) {
        return /^Mark /i.test(filterText)
          ? `Mark /${filterText.replace(/^Mark /i, '')}/ files as viewed`
          : '';
      },
      callback(filterText: string) {
        const regex = new RegExp(
          filterText.replace(/^Mark (.+)( files)?$/i, '$1'),
          'i',
        );

        githubUI.files
          .filter((file) => regex.test(file.path))
          .forEach((file) => file.viewed());
      },
    },
    {
      text: 'Collapse all',
      callback() {
        githubUI.files.forEach((file) => {
          file.collapse();
        });
      },
    },
    {
      text: 'Expand all',
      callback() {
        githubUI.files.forEach((file) => {
          file.expand();
        });
      },
    },
    {
      text: 'Current file: mark as viewed',
      callback: () => githubUI.currentFile?.viewed(),
    },
    {
      text: 'Current file: clear reviewed lines',
      callback() {
        const file = githubUI.currentFile;
        if (file) {
          clearReviewLines(file);
        }
      },
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
        githubUI.files
          .filter((file) => !file.isDeleted)
          .forEach((file) => file.loadLargeDiff());
      },
    },
    {
      text: 'Copy branch name to clipboard',
      callback() {
        const branchName = githubUI.branchName;
        if (branchName) {
          navigator.clipboard.writeText(branchName);
        }
      },
    },
    {
      text: 'Copy current file path to clipboard',
      callback() {
        const path = githubUI.currentFile?.path;
        if (path) {
          navigator.clipboard.writeText(path);
        }
      },
    },
  ].sort();
}
