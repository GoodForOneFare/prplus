import type {FileMetadata} from '../github-ui/file';
import type {FileType, FileFilter} from '../types';

import {fileFilters} from './filters';

export class FilterManager {
  readonly allFilters = fileFilters;
  private activeFilters: FileFilter[] = [];

  activateFilter(type: FileType) {
    this.activeFilters.push(fileFilters[type]);
  }

  deactivateFilter(type: FileType) {
    const filter = fileFilters[type].filter;
    this.activeFilters = this.activeFilters.filter(
      (aFilter) => aFilter.filter !== filter,
    );
  }

  filesFor(files: FileMetadata[], type: FileType) {
    return files.filter(fileFilters[type].filter);
  }

  isHidden(file: FileMetadata) {
    return this.activeFilters.some(({filter}) => filter(file));
  }
}
