import {FileMetadata, fileMetadata} from './file';
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

      const addedFiles = Array.from(addedNodes)
        .filter(
          (element): element is HTMLElement => element instanceof HTMLElement,
        )
        .filter((element) => element.classList?.contains('js-file'));

      const addedInfo = addedFiles.map(fileMetadata);
      addedCallback(addedInfo);
    });
  });

  tabsListener((isFilesView) => {
    if (isFilesView) {
      const initialFiles = Array.from(
        document.querySelectorAll<HTMLElement>('.js-file'),
      );

      addedCallback(initialFiles.map(fileMetadata));

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
    } else {
      clearedCallback();
      filesObserver.disconnect();
    }
  });
}
