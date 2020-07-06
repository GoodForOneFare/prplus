import React, {useState} from 'react';

import {Activator} from './Activator';
import {Command} from './types';
import {CommandList} from './CommandList';
import {PaletteInput} from './PaletteInput';

export interface Props {
  commands: Command[];
}

export function Palette({commands}: Props) {
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const [filter, setFilter] = useState('');
  const [visible, setVisible] = useState(false);

  const filteredCommands =
    filter === ''
      ? commands
      : commands.filter((command) =>
          command.text.toUpperCase().includes(filter),
        );

  const reset = () => {
    setFilter('');
    setVisible(false);
    setSelectedCommandIndex(0);
  };

  const selectCommand = (command: Command) => {
    command.callback();
    reset();
  };

  const input = (
    <PaletteInput
      handleReset={() => reset()}
      handleSelectCommand={() => {
        if (filteredCommands.length > 0) {
          selectCommand(filteredCommands[selectedCommandIndex]);
        }

        reset();
      }}
      handlePreviousCommand={() => {
        setSelectedCommandIndex(Math.max(0, selectedCommandIndex - 1));
      }}
      handleNextCommand={() => {
        setSelectedCommandIndex(
          Math.min(filteredCommands.length - 1, selectedCommandIndex + 1),
        );
      }}
      handleFilterChange={setFilter}
      visible={visible}
    />
  );

  const commandList = (
    <CommandList
      commands={filteredCommands}
      handleSelectCommand={selectCommand}
      selectedCommandIndex={selectedCommandIndex}
    />
  );

  return (
    <div id="__prs_command_palette" className={visible ? 'visible' : ''}>
      <div id="__prs_command_list">
        <Activator handleVisibilityChange={setVisible} />
        {commandList}
      </div>
      {input}
    </div>
  );
}
