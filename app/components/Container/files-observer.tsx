import {useEffect, useRef} from 'react';

export function useFilesObserver(callback: (newFiles: any[]) => void) {
  const files = useRef<any[]>([]);

  useEffect(() => {
    files.current.push(...Array.from(document.querySelectorAll('.js-file')));
    callback(files.current);
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const filesObserver = new MutationObserver((mutationsList) => {
      mutationsList.forEach(({addedNodes}) => {
        if (addedNodes.length === 0) {
          // Ignore the loading spinner being removed.
          return;
        }

        const addedFiles = Array.from(addedNodes)
          .filter(
            (element): element is HTMLElement => element instanceof HTMLElement,
          )
          .filter((element) => element.classList?.contains('js-file'));

        files.current.push(...addedFiles);
        callback(files.current);
      });
    });

    const fileContainers = Array.from(
      document.querySelectorAll('#files .js-diff-progressive-container'),
    );

    for (const filesContainer of fileContainers) {
      filesObserver.observe(filesContainer, {
        attributes: false,
        characterData: false,
        characterDataOldValue: false,
        childList: true,
        subtree: false,
      });
    }

    return () => filesObserver.disconnect();
  }, [callback]);
}
