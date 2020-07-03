import {findCurrentFile} from './file';

export function clearCurrentFileReviewedLines() {
  findCurrentFile()?.clearReviewedLines();
}
