import {html, useEffect, useRef} from 'haunted';

import {virtualWithProps} from '../../haunted-extensions/virtual-with-props';
import {ref} from '../../lit-html-directives/ref';

export const PaletteInput = virtualWithProps(function PaletteInput(props: {
  handleFilterChange: (filterText: string) => void;
  handleNextCommand: () => void;
  handlePreviousCommand: () => void;
  handleReset: () => void;
  handleSelectCommand: () => void;
  visible: boolean;
}) {
  const {
    handleFilterChange,
    handleNextCommand,
    handlePreviousCommand,
    handleReset,
    handleSelectCommand,
    visible,
  } = props;

  const inputElement = useRef<HTMLInputElement | null>(null);
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

  const filterKeyUpHandler = (evt: KeyboardEvent) => {
    if (evt.code === 'Escape') {
      handleReset();
    } else if (evt.code === 'Enter') {
      handleSelectCommand();
    } else if (evt.code === 'ArrowUp') {
      handlePreviousCommand();
    } else if (evt.code === 'ArrowDown') {
      handleNextCommand();
    } else {
      const input = evt.currentTarget as HTMLInputElement;
      handleFilterChange(input.value.toUpperCase());
    }
    evt.preventDefault();
    evt.cancelBubble = true;
  };

  return html`<input
    type="text"
    ?ref=${ref(inputElement)}
    @keyup=${filterKeyUpHandler}
  />`;
});
