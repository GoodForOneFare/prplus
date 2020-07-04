import {html, useEffect, useRef, useState, virtual} from 'haunted';
import {classMap} from 'lit-html/directives/class-map';
import {virtualWithProps} from 'app/haunted-extensions/virtual-with-props';
import {ref} from 'app/lit-html-directives/ref';

import {Activator} from './Activator';
import {PaletteInput} from './PaletteInput';

interface Command {
  text: string;
  callback: () => void;
}

export interface Props {
  commands: Command[];
}

const palette = virtualWithProps(({commands}: Props) => {
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const [filter, setFilter] = useState('');
  const [visible, setVisible] = useState(false);

  const selectedOptionElement = useRef<HTMLElement | null>(null);
  useEffect(() => {
    selectedOptionElement.current?.scrollIntoView(false);
  }, [selectedOptionElement.current]);

  if (!visible) {
    return Activator({handleVisibilityChange: setVisible});
  }

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

  const input = PaletteInput({
    handleReset: () => reset(),
    handleSelectCommand: () => {
      if (filteredCommands.length > 0) {
        selectCommand(filteredCommands[selectedCommandIndex]);
      }

      reset();
    },
    handlePreviousCommand: () => {
      setSelectedCommandIndex(Math.max(0, selectedCommandIndex - 1));
    },
    handleNextCommand: () => {
      setSelectedCommandIndex(
        Math.min(filteredCommands.length - 1, selectedCommandIndex + 1),
      );
    },
    handleFilterChange: setFilter,
    visible,
  });

  const paletteList = html`
    <div id="__prs_command_list">
      ${Activator({handleVisibilityChange: setVisible})}
      <ul>
        ${filteredCommands.map(
          (command, commandIndex) =>
            html`<li
              ?ref=${commandIndex === selectedCommandIndex
                ? ref(selectedOptionElement)
                : null}
              class=${classMap({
                selected: commandIndex === selectedCommandIndex,
              })}
              @click=${() => selectCommand(command)}
            >
              ${command.text}
            </li>`,
        )}
      </ul>
    </div>
  `;

  return html`
    <div id="__prs_command_palette" class=${classMap({visible})}>
      ${paletteList} ${input}
    </div>
  `;
});

export {palette};
