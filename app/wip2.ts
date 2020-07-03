import {updateToolbarSummary} from './toolbar';
import './review-listener';
import './files-observer';

document.body.removeEventListener('click', updateToolbarSummary);
document.body.addEventListener('click', () => {
  setTimeout(updateToolbarSummary, 500);
});

updateToolbarSummary();

function updateToolbar() {
  const branchName = document.querySelector('.head-ref');
  if (!branchName) {
    return;
  }

  document.querySelector('.toolbar-branch-name')?.remove();

  const toolbarBranchName = document.createElement('span');
  toolbarBranchName.classList.add('toolbar-branch-name');
  toolbarBranchName.innerHTML = branchName.outerHTML;
  toolbarBranchName
    .querySelector('.css-truncate-target')
    ?.classList.remove('css-truncate-target');
  toolbarBranchName.addEventListener('click', (evt) => {
    navigator.clipboard.writeText(toolbarBranchName.innerText);
    evt.preventDefault();
  });

  const toolbarPRNumber = document.querySelector(
    '.pr-toolbar .gh-header-number, .gh-header .gh-header-number',
  );
  toolbarPRNumber?.appendChild(toolbarBranchName);
}

updateToolbar();

(function defaltFilesTabToWhitespace() {
  const filesTab = document.querySelector('a.tabnav-tab[href$=files]') as
    | HTMLAnchorElement
    | undefined;
  if (filesTab) {
    filesTab.href += '?w=1';
  }
})();
