import React, {useEffect, useState, useMemo} from 'react';

import {Command} from '../../types';
import {ReviewLines} from '../../ReviewLines';
import {PrStorage} from '../../PRStorage';
import {Activator} from '../Activator';
import {Palette} from '../CommandPalette';

// import {useFilesObserver, FileMetadata} from './files-observer';

export interface ContainerProps {
  commands: Command[];
  // reviewLines: ReviewLines;
  // storage: PrStorage;
}

// function checkForFilesView() {
//   return window.location.pathname.endsWith('/files');
// }

// function File({path}: {path: string}) {
//   console.log('@@creating file', path);
//   return null;
// }

export function Container({commands}: ContainerProps) {
  const [isVisible, setIsVisible] = useState(false);
  // const [isFilesView, setIsFilesView] = useState(checkForFilesView());
  // const [files, setFiles] = useState([] as FileMetadata[]);

  // useEffect(() => {
  //   const tabObserver = new MutationObserver(() => {
  //     setIsFilesView(checkForFilesView());
  //   });

  //   tabObserver.observe(document.querySelector('main')!, {childList: true});

  //   return () => tabObserver.disconnect();
  // }, []);

  // useEffect(() => {
  //   requestAnimationFrame(() => {
  //     reviewLines.handleReviewedIds(storage.reviewedLines);
  //   });
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  // useFilesObserver((allFiles) => {
  //   reviewLines.handleReviewedIds(storage.reviewedLines);
  //   setFiles([...allFiles]);
  // });

  // const filesHTML = useMemo(() => {
  //   return files.map((file) => <File key={file.path} path={file.path} />);
  // }, [files]);

  // console.log('@@FILES', files.length);
  return (
    <>
      <Activator handleVisibilityChange={setIsVisible} />
      <Palette
        commands={commands}
        isVisible={isVisible}
        onReset={() => setIsVisible(false)}
      />
      {/* {filesHTML} */}
    </>
  );
}
