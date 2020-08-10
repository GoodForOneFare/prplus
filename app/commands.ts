import {GithubUI} from './github-ui';
import {Command, FilterManager, FileType} from './types';

export function generateCommands(
  githubUI: GithubUI,
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
            callback: () => filterManager.activateFilter(key as FileType),
          },
          {
            text: `Show ${text} files`,
            callback: () => filterManager.deactivateFilter(key as FileType),
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
          ? `Collapse ${filterText.replace(/^Collapse /i, '')} files`
          : '';
      },
      callback(filterText: string) {
        const regex = new RegExp(filterText);
        githubUI.files
          .filter((file) => regex.test(file.path))
          .forEach((file) => file.collapse());
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
          .forEach((file) => file.expand());
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
          .forEach((file) => file.hide());
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
          .forEach((file) => file.show());
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
  ].sort();
}
