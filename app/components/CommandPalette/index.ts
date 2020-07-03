import {html, useEffect, useRef, useState, virtual} from 'haunted';
import {classMap} from 'lit-html/directives/class-map';

import {ref} from '../../lit-html-directives/ref';

interface Command {
  text: string;
  callback: () => void;
}

export interface Props {
  commands: Command[];
}

const palette = virtual((...args: any[]) => {
  const props: Props = args[0];
  const commands = props.commands;
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const [filter, setFilter] = useState('');
  const [visible, setVisible] = useState(false);

  const selectedOptionElement = useRef<HTMLElement | null>(null);
  useEffect(() => {
    selectedOptionElement.current?.scrollIntoView(false);
  }, [selectedOptionElement.current]);

  const inputElement = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    document.addEventListener('keydown', (evt) => {
      if (evt.shiftKey && evt.metaKey) {
        if (evt.code === 'KeyP') {
          setVisible(true);
          evt.preventDefault();
        }
      }
    });
  }, []);

  useEffect(() => {
    const element = inputElement.current;
    if (element) {
      if (visible) {
        element.focus();
      } else {
        element.value = '';
      }
    }
  }, [visible, inputElement.current]);

  if (!visible) {
    return null;
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

  const filterKeyUpHandler = (evt: KeyboardEvent) => {
    if (evt.code === 'Escape') {
      reset();
    } else if (evt.code === 'Enter') {
      if (filteredCommands.length > 0) {
        selectCommand(filteredCommands[selectedCommandIndex]);
      }

      reset();
    } else if (evt.code === 'ArrowUp') {
      setSelectedCommandIndex(Math.max(0, selectedCommandIndex - 1));
    } else if (evt.code === 'ArrowDown') {
      setSelectedCommandIndex(
        Math.min(filteredCommands.length - 1, selectedCommandIndex + 1),
      );
    } else {
      const input = evt.currentTarget as HTMLInputElement;
      setFilter(input.value.toUpperCase());
    }
    evt.preventDefault();
    evt.cancelBubble = true;
  };

  const paletteInput = html`<input
    type="text"
    ?ref=${ref(inputElement)}
    @keyup=${filterKeyUpHandler}
  />`;
  const paletteList = html`
    <div id="__prs_command_list">
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
      ${paletteList} ${paletteInput}
    </div>
  `;
});

export {palette};
