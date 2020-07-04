export interface Command {
  text: string;
  callback: () => void;
}
