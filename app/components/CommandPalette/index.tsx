import React, {useState} from 'react';

import {Command} from '../../types';

import {CommandList} from './CommandList';
import {PaletteInput} from './PaletteInput';

export interface Props {
  commands: Command[];
  isFilesView: boolean;
  isVisible: boolean;
  onReset: () => void;
}

export function Palette({commands, isVisible, onReset}: Props) {
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const [filter, setFilter] = useState('');

  const uppercaseFilter = filter.toUpperCase();
  const filteredCommands =
    uppercaseFilter === ''
      ? commands
      : commands.filter((command) =>
          typeof command.text === 'string'
            ? command.text.toUpperCase().includes(uppercaseFilter)
            : command.text(filter).toUpperCase().includes(uppercaseFilter),
        );

  const reset = () => {
    setFilter('');
    setSelectedCommandIndex(0);
    onReset();
  };

  const selectCommand = (command: Command) => {
    command.callback(filter);
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
      visible={isVisible}
    />
  );

  const commandList = (
    <CommandList
      commands={filteredCommands}
      filterText={filter}
      handleSelectCommand={selectCommand}
      selectedCommandIndex={selectedCommandIndex}
    />
  );

  const classNames = isVisible ? 'visible' : '';

  return (
    <div id="__prs_command_palette" className={classNames}>
      <div id="__prs_command_list">{commandList}</div>
      {input}
    </div>
  );
}
