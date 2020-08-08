export type CommandTextCallback = (filterText: string) => string;

export interface Command {
  text: string | CommandTextCallback;
  callback(filterText: string): void;
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
