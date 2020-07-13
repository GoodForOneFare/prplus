export interface Command {
  text: string;
  callback: () => void;
}

export enum DiffType {
  Unified = 'unified',
  Split = 'split',
}

export type ReviewLineId = string;

export enum ReviewLineSide {
  Left = 'L',
  Right = 'R',
}
