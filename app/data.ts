export type ReviewLineSide = 'L' | 'R';

export interface ScrutinyBlock {
  filePath: string;
  side: ReviewLineSide;
  lineNumbers: string[];
}

type FilePath = string;

interface PR {
  files: Record<
    FilePath,
    {
      lines?: Record<string, boolean>;
      scrutinyBlocks?: ScrutinyBlock[];
    }
  >;
}
type PRId = string;
type PullRequestLocalStorage = Record<PRId, PR>;

const prs: PullRequestLocalStorage = window.localStorage.__prs
  ? JSON.parse(window.localStorage.__prs)
  : {};

const prId = window.location.pathname.replace(/(.+[/]pull[/]\d+).*/, '$1');

function getPrData() {
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
}) {
  const prData = getPrData();
  let fileData = prData.files[filePath];
  console.log('@@fileData1', fileData);
  if (!fileData) {
    fileData = {lines: {}, scrutinyBlocks: []};
    prData.files[filePath] = fileData;
  }

  if (!fileData.lines) {
    fileData.lines = {};
  }
  if (!fileData.scrutinyBlocks) {
    fileData.scrutinyBlocks = [];
  }

  return fileData;
}

export {prs};

export function savePrData() {
  window.localStorage.__prs = JSON.stringify(prs);
}
