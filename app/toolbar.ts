export function switchToSplitDiff() {
  const checkbox = document.querySelector<HTMLInputElement>(
    'input[type=radio][name=diff][value=split]:not([checked])',
  );
  if (checkbox) {
    checkbox.checked = true;
    const whitespaceButton = document.querySelector<HTMLElement>(
      '#whitespace-cb ~ button',
    );
    whitespaceButton?.click();
  }
}

export function switchToUnifiedDiff() {
  const checkbox = document.querySelector<HTMLInputElement>(
    'input[type=radio][name=diff][value=unified]:not([checked])',
  );
  if (checkbox) {
    checkbox.checked = true;
    const whitespaceButton = document.querySelector<HTMLElement>(
      '#whitespace-cb ~ button',
    );
    whitespaceButton?.click();
  }
}

export function toggleWhitespace() {
  const [checkbox, submit] = document.querySelectorAll<HTMLInputElement>(
    '#whitespace-cb, #whitespace-cb ~ button',
  );
  checkbox.checked = true;
  submit.click();
}

export function updateToolbarSummary() {}

export function addBranchNameToToolbar() {
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
    '.pr-toolbar .gh-header-number',
  );
  toolbarPRNumber?.appendChild(toolbarBranchName);
}
