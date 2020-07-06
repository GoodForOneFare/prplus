import {useEffect} from 'react';

export interface ActivatorProps {
  handleVisibilityChange: (isVisible: boolean) => void;
}

export function Activator({handleVisibilityChange}: ActivatorProps) {
  const keydownHandler = (evt: KeyboardEvent) => {
    if (evt.shiftKey && evt.metaKey) {
      if (evt.code === 'KeyP') {
        handleVisibilityChange(true);
        evt.preventDefault();
      }
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', keydownHandler);
    return () => window.removeEventListener('keydown', keydownHandler);
  }, []);

  return null;
}
