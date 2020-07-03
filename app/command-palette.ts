import {html, useEffect, useRef, useState, virtual} from 'haunted';
import {classMap} from 'lit-html/directives/class-map';

import {ref} from './lit-html-directives/ref';

const palette = virtual(({commands}) => {
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const [filter, setFilter] = useState('');
  const [visible, setVisible] = useState(false);

  const inputElement = useRef(null);
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
    if (!inputElement.current) {
      return;
    }

    if (visible) {
      inputElement.current.focus();
    } else {
      inputElement.current.value = '';
    }
  }, [visible, inputElement.current]);

  const filteredCommands =
    filter === ''
      ? commands
      : commands.filter((command) =>
          command.text.toUpperCase().includes(filter),
        );

  const filterKeyUpHandler = (evt) => {
    if (evt.code === 'Escape') {
      // Hiding the palette will trigger a `change` event unless its input
      // is returned to its original value.
      setFilter('');
      //   inputElement.current.value = '';
      setVisible(false);
      setSelectedCommandIndex(0);
    } else if (evt.code === 'Enter') {
      if (filteredCommands.length > 0) {
        // TODO: I think command.callback will never be set, but I'm hacking around it for a demo.
        const callback =
          filteredCommands[selectedCommandIndex].callback ||
          filteredCommands[selectedCommandIndex].command.callback;

        callback();
      }

      setVisible(false);
      setSelectedCommandIndex(0);
      //   inputElement.current.value = '';
      setFilter('');
    } else if (evt.code === 'ArrowUp') {
      setSelectedCommandIndex(Math.max(0, selectedCommandIndex - 1));
    } else if (evt.code === 'ArrowDown') {
      setSelectedCommandIndex(
        Math.min(filteredCommands.length - 1, selectedCommandIndex + 1),
      );
    } else {
      setFilter(evt.target.value.toUpperCase());
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
      ${filteredCommands.map(
        (command, commandIndex) =>
          html`<li
            class=${classMap({selected: commandIndex === selectedCommandIndex})}
          >
            ${command.text}
          </li>`,
      )}
    </div>
  `;

  return html`
    <div id="__prs_command_palette" class=${classMap({visible})}>
      ${paletteList} ${paletteInput}
    </div>
  `;
});

export {palette};
