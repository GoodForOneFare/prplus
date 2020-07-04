import {html, useEffect, useRef, useState} from 'haunted';
import {classMap} from 'lit-html/directives/class-map';

import {virtualWithProps} from '../../haunted-extensions/virtual-with-props';
import {ref} from '../../lit-html-directives/ref';

import {Command} from './types';

interface CommandListProps {
  commands: Command[];
  handleSelectCommand: (command: Command) => void;
  selectedCommandIndex: number;
}

export const CommandList = virtualWithProps(function CommandList({
  commands,
  handleSelectCommand,
  selectedCommandIndex,
}: CommandListProps) {
  const selectedOptionElement = useRef<HTMLElement | null>(null);
  useEffect(() => {
    selectedOptionElement.current?.scrollIntoView(false);
  }, [selectedOptionElement.current]);

  return html`<ul>
    ${commands.map(
      (command, commandIndex) =>
        html`<li
          ?ref=${commandIndex === selectedCommandIndex
            ? ref(selectedOptionElement)
            : null}
          class=${classMap({
            selected: commandIndex === selectedCommandIndex,
          })}
          @click=${() => handleSelectCommand(command)}
        >
          ${command.text}
        </li>`,
    )}
  </ul>`;
});
