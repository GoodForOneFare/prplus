export function addActivationListener(callback: () => void) {
  const keydownHandler = (evt: KeyboardEvent) => {
    if (evt.shiftKey && evt.metaKey) {
      if (evt.code === 'KeyP') {
        callback();
        evt.preventDefault();
        document.removeEventListener('keydown', keydownHandler);
      }
    }
  };

  document.addEventListener('keydown', keydownHandler);
}

export function removeActivationListener(callback: () => void) {
  document.removeEventListener('keydown', callback);
}
