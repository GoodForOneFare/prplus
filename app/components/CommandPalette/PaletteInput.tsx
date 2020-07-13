import React, {useEffect, useRef, KeyboardEvent} from 'react';

export function PaletteInput(props: {
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
  }, [visible]);

  const filterKeyUpHandler = (evt: KeyboardEvent<HTMLInputElement>) => {
    if (evt.key === 'Escape') {
      handleReset();
    } else if (evt.key === 'Enter') {
      handleSelectCommand();
    } else if (evt.key === 'ArrowUp') {
      handlePreviousCommand();
    } else if (evt.key === 'ArrowDown') {
      handleNextCommand();
    } else {
      const input = evt.currentTarget as HTMLInputElement;
      handleFilterChange(input.value.toUpperCase());
    }
    evt.preventDefault();
  };

  const filterInputId = 'filterInput';
  return (
    <form>
      <label htmlFor={filterInputId} style={{display: 'none'}}>
        Filter:
      </label>
      <input
        aria-labelledby={filterInputId}
        id={filterInputId}
        type="text"
        ref={inputElement}
        onKeyUp={filterKeyUpHandler}
      />
    </form>
  );
}
