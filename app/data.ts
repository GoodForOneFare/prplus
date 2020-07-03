export type ReviewLineSide = 'L' | 'R';

type FilePath = string;

export interface PRFileData {
  lines: Record<string, boolean>;
}

interface PR {
  files: Record<FilePath, PRFileData>;
}
type PRId = string;
type PullRequestLocalStorage = Record<PRId, PR>;

const prs: PullRequestLocalStorage = window.localStorage.__prs
  ? JSON.parse(window.localStorage.__prs)
  : {};

const prId = window.location.pathname.replace(/(.+[/]pull[/]\d+).*/, '$1');

function getPrData(prId: string) {
  let pr = prs[prId];
  if (!pr) {
    pr = {files: {}};
    prs[prId] = pr;
  }
  return prs[prId];
}

export function getPrFileData({
  prId,
  filePath,
}: {
  prId: string;
  filePath: string;
}): PRFileData {
  const prData = getPrData(prId);
  let fileData = prData.files[filePath];

  if (!fileData) {
    fileData = {lines: {}};
    prData.files[filePath] = fileData;
  }

  if (!fileData.lines) {
    fileData.lines = {};
  }

  return fileData;
}

export {prs};

export function savePrData() {
  window.localStorage.__prs = JSON.stringify(prs);
}
