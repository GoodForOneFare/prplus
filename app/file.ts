export function updateHeader(file) {
  const [additions, deletions, reviewedAdditions, reviewedDeletions] = [
    file.querySelectorAll('.blob-num-addition').length,
    file.querySelectorAll('.blob-num-deletion').length,
    file.querySelectorAll('.blob-num-addition.prs--reviewed').length,
    file.querySelectorAll('.blob-num-deletion.prs--reviewed').length,
  ];

  const container = file.querySelector('.file-header .file-actions');
  let progress = container.querySelector('.prs--review-progress');
  if (!progress) {
    container.style.display = 'flex';
    container.style.alignItems = 'center';

    progress = document.createElement('div');
    progress.classList.add('prs--review-progress');
    container.prepend(progress);
  }

  const addedProgress = additions
    ? `${Math.floor((reviewedAdditions / additions) * 100)}%`
    : '-';
  const deletionProgress = deletions
    ? `${Math.floor((reviewedDeletions / deletions) * 100)}%`
    : '-';
  progress.innerHTML = `
          ${addedProgress}, ${deletionProgress}
        `;
}
