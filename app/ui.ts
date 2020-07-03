import {render} from 'haunted';

import {generateCommands} from './commands';
import {palette} from './command-palette';

const container = document.createElement('div');
document.body.appendChild(container);
render(palette({commands: generateCommands()}), container);
