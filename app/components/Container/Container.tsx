import React, {useState} from 'react';

import type {Command} from '../../types';
import {Activator} from '../Activator';
import {Palette} from '../CommandPalette';

export interface ContainerProps {
  commands: Command[];
}

export function Container({commands}: ContainerProps) {
  const [isVisible, setIsVisible] = useState(false);
  return (
    <>
      <Activator handleVisibilityChange={setIsVisible} />
      <Palette
        commands={commands}
        isVisible={isVisible}
        onReset={() => setIsVisible(false)}
      />
    </>
  );
}
