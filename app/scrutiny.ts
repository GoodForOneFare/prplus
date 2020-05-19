import {findFile, findCurrentFile} from './file';

export function clearCurrentFileScrutinyLines() {
  findCurrentFile()?.clearScrutinyLines();
}
