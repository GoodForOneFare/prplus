import {FileMetadata} from './github-ui/file';
import {ReviewLines} from './types';

export interface PRReviewLines {
  reviewedLines: ReviewLines;
}

export interface PRLocaleStorage {
  [filePath: string]: PRReviewLines;
}

export class Storage {
  private data: PRLocaleStorage | undefined;

  constructor(private prId?: string) {}

  initialize() {
    const prId = this.prId;
    if (!prId) {
      return;
    }

    if (localStorage[prId]) {
      this.data = JSON.parse(localStorage[prId]);
    } else {
      this.data = {};
    }
  }

  getReviewedLines(file: FileMetadata): PRReviewLines['reviewedLines'] {
    const prId = this.prId;
    if (!prId) {
      return {};
    }
    return this.data![file.path]?.reviewedLines ?? {};
  }

  addReviewedLines(file: FileMetadata, lines: ReviewLines) {
    const prId = this.prId;
    const data = this.data;
    const path = file.path;
    if (!prId || !data) {
      return;
    }

    if (!data[path]) {
      data[path] = {reviewedLines: {}};
    }

    Object.entries(lines).forEach(([lineId, code]) => {
      data[path].reviewedLines[lineId] = code;
    });
  }

  clearReviewLines(file: FileMetadata | undefined) {
    if (file && this.data) {
      delete this.data[file.path];
    }
  }

  save() {
    const {data, prId} = this;
    if (prId && data) {
      localStorage[prId] = JSON.stringify(this.data, null, 2);
    }
  }
}
