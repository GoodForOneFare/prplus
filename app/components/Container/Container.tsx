import React, {useEffect, useState} from 'react';

import {Command} from '../../types';
import {ReviewLines} from '../../ReviewLines';
import {PrStorage} from '../../PRStorage';
import {Activator} from '../Activator';
import {Palette} from '../CommandPalette';

import {useFilesObserver} from './files-observer';

export interface ContainerProps {
  commands: Command[];
  reviewLines: ReviewLines;
  storage: PrStorage;
}

function checkForFilesView() {
  return window.location.pathname.endsWith('/files');
}

export function Container({commands, reviewLines, storage}: ContainerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isFilesView, setIsFilesView] = useState(checkForFilesView());

  useEffect(() => {
    const tabObserver = new MutationObserver(() => {
      setIsFilesView(checkForFilesView());
    });

    tabObserver.observe(document.querySelector('main')!, {childList: true});

    return () => tabObserver.disconnect();
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => {
      reviewLines.handleReviewedIds(storage.reviewedLines);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFilesObserver(() => {
    reviewLines.handleReviewedIds(storage.reviewedLines);
  });

  return (
    <>
      <Activator handleVisibilityChange={setIsVisible} />
      <Palette
        commands={commands}
        isVisible={isVisible}
        isFilesView={isFilesView}
        onReset={() => setIsVisible(false)}
      />
    </>
  );
}
