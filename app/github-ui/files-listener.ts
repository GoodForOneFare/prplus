import type {FileMetadata} from './file';
import {fileMetadata} from './file';
import {tabsListener} from './tabs-listener';

export function filesListener({
  addedCallback,
  clearedCallback,
}: {
  addedCallback: (files: FileMetadata[]) => void;
  clearedCallback: () => void;
}) {
  const filesObserver = new MutationObserver((mutationsList) => {
    mutationsList.forEach(({addedNodes}) => {
      if (addedNodes.length === 0) {
        // Ignore the loading spinner being removed.
        return;
      }

      const htmlElements = Array.from(addedNodes).filter(
        (element): element is HTMLElement => element instanceof HTMLElement,
      );

      const addedFiles = htmlElements.filter((element) =>
        element.classList?.contains('js-file'),
      );

      const addedInfo = addedFiles.map(fileMetadata);
      addedCallback(addedInfo);

      // New placeholder containers for files are nested within added nodes.
      addContainerListener(
        htmlElements.filter((element) =>
          element.classList?.contains('js-diff-progressive-container'),
        ),
      );
    });
  });

  function addContainerListener(containers: Iterable<HTMLElement>) {
    for (const filesContainer of containers) {
      filesObserver.observe(filesContainer, {
        attributes: false,
        characterData: false,
        characterDataOldValue: false,
        childList: true,
        subtree: false,
      });
    }
  }

  tabsListener((isFilesView) => {
    if (isFilesView) {
      const initialFiles = Array.from(
        document.querySelectorAll<HTMLElement>('.js-file'),
      );

      addedCallback(initialFiles.map(fileMetadata));

      addContainerListener(
        document.querySelectorAll('#files .js-diff-progressive-container'),
      );
    } else {
      clearedCallback();
      filesObserver.disconnect();
    }
  });
}
