import {FileMetadata} from './github-ui/file';

export type CommandTextCallback = (filterText: string) => string;

export interface Command {
  text: string | CommandTextCallback;
  callback(filterText: string): void;
}

export enum DiffType {
  Unified = 'unified',
  Split = 'split',
}

export type FileType =
  | 'css'
  | 'data'
  | 'deleted'
  | 'graphql'
  | 'image'
  | 'javascript'
  | 'renamed'
  | 'sass'
  | 'style'
  | 'svg'
  | 'json'
  | 'test'
  | 'typescript'
  | 'viewed'
  | 'yml';

export interface FileFilterName {
  (filterText: string): string;
}

export interface FileFilter {
  filter: (file: FileMetadata) => boolean;
  text: string | FileFilterName;
}

export interface FilterManager {
  readonly allFilters: Record<FileType, FileFilter>;
  activateFilter(type: FileType): void;
  deactivateFilter(type: FileType): void;
}

export type ReviewLineId = string;

export enum ReviewLineSide {
  Left = 'L',
  Right = 'R',
}
