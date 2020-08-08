import {useEffect, useRef} from 'react';

export interface FileMetadata {
  id: string;
  path: string;
  element: HTMLElement;
  header: HTMLElement;
}

function fileMetadata(file: HTMLElement): FileMetadata {
  const header = file.querySelector<HTMLElement>('.file-header')!;
  return {
    id: file.id,
    element: file,
    header,
    path: header.dataset.path!,
  };
}

export function useFilesObserver(callback: (files: any[]) => void) {
  const files = useRef<FileMetadata[]>([]);

  useEffect(() => {
    const initialFiles = Array.from(
      document.querySelectorAll<HTMLElement>('.js-file'),
    );
    files.current.push(...initialFiles.map(fileMetadata));
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

        const addedInfo = addedFiles.map(fileMetadata);
        files.current.push(...addedInfo);
        console.log(
          '@@filesObserver found ',
          addedInfo.length,
          files.current.length,
        );
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

    return () => {
      console.log('@@filesObserver.disconnect');
      return filesObserver.disconnect();
    };
  }, [callback]);
}
