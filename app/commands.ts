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
        return `Collapse ${regexFilterToText(filterText)} files`;
      },
      callback(filterText: string) {
        const normalizedFilter = extractRegexFromFilter(filterText);

        githubUI.files
          .filter((file) => file.path.match(normalizedFilter))
          .forEach((file) => file.collapse());
      },
      match(filterText: string) {
        return /^CO?L?L?A?P?S?E? ?[/]/i.test(filterText);
      },
    },
    {
      text(filterText: string) {
        return `Expand ${regexFilterToText(filterText)} files`;
      },
      callback(filterText: string) {
        const normalizedFilter = extractRegexFromFilter(filterText);

        githubUI.files
          .filter((file) => file.path.match(normalizedFilter))
          .forEach((file) => file.expand());
      },
      match(filterText: string) {
        return /^EX?P?A?N?D? ?[/]/i.test(filterText);
      },
    },
    {
      text(filterText: string) {
        return `Hide ${regexFilterToText(filterText)} files`;
      },
      callback(filterText: string) {
        const normalizedFilter = extractRegexFromFilter(filterText);

        githubUI.files
          .filter((file) => file.path.match(normalizedFilter))
          .forEach((file) => file.hide());
      },
      match(filterText: string) {
        return /^HI?D?E? ?[/]/i.test(filterText);
      },
    },
    {
      text(filterText: string) {
        return `Show ${regexFilterToText(filterText)} files`;
      },
      callback(filterText: string) {
        const normalizedFilter = extractRegexFromFilter(filterText);

        githubUI.files
          .filter((file) => file.path.match(normalizedFilter))
          .forEach((file) => file.show());
      },
      match(filterText: string) {
        return /^SH?O?W? ?[/]/i.test(filterText);
      },
    },
    {
      text(filterText: string) {
        return `Mark ${regexFilterToText(filterText)} files as viewed`;
      },
      callback(filterText: string) {
        const normalizedFilter = extractRegexFromFilter(filterText);

        githubUI.files
          .filter((file) => file.path.match(normalizedFilter))
          .forEach((file) => file.viewed());
      },
      match(filterText: string) {
        return /^MA?R?K? ?[/]/i.test(filterText);
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

function extractRegexFromFilter(filterText: string) {
  return filterText.replace(/.+?[/](.*)/, '$1').replace(/(.+)[/].+/, '$1');
}

function regexFilterToText(filterText: string) {
  const normalizedFilter =
    extractRegexFromFilter(filterText) || '<regular expression>';
  return `/${normalizedFilter}/`;
}
