export function findCurrentFile() {
  return Array.from(
    document.querySelectorAll(
      '.js-file:not([data-file-user-viewed=true]) .file-header',
    ),
  ).find((header) => header.getBoundingClientRect().y >= 60);
}
