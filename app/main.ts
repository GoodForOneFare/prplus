import './ui';

import {addBranchNameToToolbar, updateToolbarSummary} from './toolbar';
import './review-listener';
import './files-observer';

document.body.removeEventListener('click', updateToolbarSummary);
document.body.addEventListener('click', () => {
  setTimeout(updateToolbarSummary, 500);
});

updateToolbarSummary();
addBranchNameToToolbar();

(function defaltFilesTabToWhitespace() {
  const filesTab = document.querySelector('a.tabnav-tab[href$=files]') as
    | HTMLAnchorElement
    | undefined;
  if (filesTab) {
    filesTab.href += '?w=1';
  }
})();
