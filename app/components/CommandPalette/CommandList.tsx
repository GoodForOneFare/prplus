import React, {useEffect, useRef} from 'react';

import {Command} from '../../types';

interface CommandListProps {
  commands: Command[];
  handleSelectCommand: (command: Command) => void;
  selectedCommandIndex: number;
}

export function CommandList({
  commands,
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
        return (
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
          <li
            key={command.text}
            className={className}
            onClick={() => handleSelectCommand(command)}
            ref={ref}
          >
            {command.text}
          </li>
        );
      })}
    </ul>
  );
}
