import {directive} from 'lit-html';

// Adapted from https://github.com/matthewp/haunted/issues/65
export const ref = directive((refInstance) => (part) => {
  refInstance.current = part.element;
});
