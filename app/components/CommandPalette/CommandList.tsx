import React, {useEffect, useRef} from 'react';

import {Command} from '../../types';

interface CommandListProps {
  commands: Command[];
  filterText: string;
  handleSelectCommand: (command: Command) => void;
  selectedCommandIndex: number;
}

export function CommandList({
  commands,
  filterText,
  handleSelectCommand,
  selectedCommandIndex,
}: CommandListProps) {
  const selectedOptionElement = useRef<HTMLLIElement | null>(null);
  useEffect(() => {
    selectedOptionElement.current?.scrollIntoView(false);
  });

  return (
    <ul>
      {commands.map((command, commandIndex) => {
        const isSelected = commandIndex === selectedCommandIndex;
        const className = isSelected ? 'selected' : '';
        const ref = isSelected ? selectedOptionElement : null;
        const text =
          typeof command.text === 'string'
            ? command.text
            : command.text(filterText);

        return (
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
          <li
            key={text}
            className={className}
            onClick={() => handleSelectCommand(command)}
            ref={ref}
          >
            {text}
          </li>
        );
      })}
    </ul>
  );
}
