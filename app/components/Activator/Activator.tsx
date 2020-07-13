import {useEffect, useCallback} from 'react';

export interface ActivatorProps {
  handleVisibilityChange: (isVisible: boolean) => void;
}

export function Activator({handleVisibilityChange}: ActivatorProps) {
  const keydownHandler = useCallback(
    (evt: KeyboardEvent) => {
      if (evt.shiftKey && evt.metaKey) {
        if (evt.code === 'KeyP') {
          handleVisibilityChange(true);
          evt.preventDefault();
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    document.addEventListener('keydown', keydownHandler);
    return () => window.removeEventListener('keydown', keydownHandler);
  }, [keydownHandler]);

  return null;
}
