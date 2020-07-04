import {virtual} from 'haunted';
import {NodePart} from 'lit-html';

export function virtualWithProps<T>(
  renderer: (this: NodePart, props: T) => unknown | void,
) {
  const generalRenderer = renderer as (
    // This should be typed as NodeParts, but it results in a type error that
    // I can't figure out.
    this: any,
    ...args: unknown[]
  ) => unknown;

  const result = virtual(generalRenderer);
  return result as (props: T) => (part: NodePart) => void;
}
