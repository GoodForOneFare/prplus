import {render} from 'haunted';

import {generateCommands} from './commands';
import {palette} from './components';

const container = document.createElement('div');
document.body.appendChild(container);
render(palette({commands: generateCommands()}), container);
