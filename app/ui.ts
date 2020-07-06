import {render} from 'react-dom';
import {createElement} from 'react';

import {generateCommands} from './commands';
import {Palette} from './components';

const container = document.createElement('div');
document.body.appendChild(container);
render(createElement(Palette, {commands: generateCommands()}), container);
