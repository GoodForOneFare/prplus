import React, {useEffect, useRef} from 'react';

import {Command} from './types';

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
  }, [selectedOptionElement.current]);

  return (
    <ul>
      {commands.map((command, commandIndex) => (
        <li
          key={command.text}
          className={commandIndex === selectedCommandIndex ? 'selected' : ''}
          onClick={() => handleSelectCommand(command)}
          ref={
            commandIndex === selectedCommandIndex ? selectedOptionElement : null
          }
        >
          {command.text}
        </li>
      ))}
    </ul>
  );
}
