export const ReviewLineObserver = {
  addSingleLineSelectionListener(callback: (ids: HTMLElement[]) => void) {
    document.body.addEventListener('click', (evt) => {
      if (!evt.metaKey) {
        return;
      }

      const target = evt.target as HTMLElement;
      if (
        target.classList.contains('blob-num-addition') ||
        target.classList.contains('blob-num-deletion')
      ) {
        if (!evt.altKey) {
          evt.preventDefault();
          callback([target]);
        }
      }
    });
  },

  addBlockSelectionListener(callback: (ids: HTMLElement[]) => void) {
    let isDragging = false;
    document.addEventListener('mousedown', (evt) => {
      if (!evt.metaKey) {
        return;
      }
      const target = evt.target as HTMLElement;
      isDragging =
        target.tagName === 'TD' && target.classList.contains('blob-num');
    });

    document.addEventListener('mouseup', (evt) => {
      if (!isDragging) {
        return;
      }

      isDragging = false;
      if (!evt.metaKey) {
        return;
      }

      callback(
        Array.from(
          document.querySelectorAll<HTMLElement>('.blob-num.selected-line'),
        ),
      );
    });
  },
};
