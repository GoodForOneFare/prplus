export function findCurrentFile() {
  return Array.from(
    document.querySelectorAll<HTMLElement>(
      '.js-file:not([data-file-user-viewed]) .file-header',
    ),
  ).find((header) => header.getBoundingClientRect().y >= 60);
}

export function isFilesView() {
  return Boolean(
    document.querySelector(
      "nav.tabnav-tabs .tabnav-tab.selected[href*='/files']",
    ),
  );
}
