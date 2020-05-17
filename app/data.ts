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

export {prs};
