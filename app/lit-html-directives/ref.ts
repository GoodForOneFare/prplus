import {directive, BooleanAttributePart} from 'lit-html';

// Adapted from https://github.com/matthewp/haunted/issues/65
export const ref = directive((refInstance) => (part: BooleanAttributePart) => {
  refInstance.current = part.element;
});
