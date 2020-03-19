table = $0.closest('.file').querySelector('.js-diff-table')
lines = table.querySelectorAll('tr');

let importStart = -1;
let importEnd = 0;

function isEmpty(element) {
    return !element.innerText.trim();
}

function isImport(element) {
    const text = element.innerText;
    const hasImport = text.startsWith('import ');
    return {
        hasImport,
        hasOpenImport: hasImport && text.startsWith('import {'),
    };
}

function isExport(element) {
    const text = element.innerText;
    if (!text.startsWith('export ')) {
        return {hasExport: false, hasOpenExport: false};
    }

    if (text.startsWith('export {')) {
        return {hasExport: true, hasOpenExport: true};
    }

    if (text.startsWith('export function') ||
        text.startsWith('export const')) {
      return {hasExport: false, hasOpenExport: false};
    }

    if (text.match(/^export default [a-zA-Z0-9];$/)) {
      return {hasExport: true, hasOpenExport: false};
    }
    
    return true;
}

for (const [index, line] of Object.entries(lines)) {
  if (line.dataset.position != null) {    
    if (importStart === -1) {
        importStart = index;
    }
    console.log('@@hunk', index, line);
    importEnd = index;
    continue;
  } else if (line.classList.contains("inline-comments")) {
    continue;
  } else {
    const [left, right] = line.querySelectorAll('.blob-code-deletion, .blob-code-addition, .blob-code-context, .blob-code-empty, .blob-code-hunk');
    if (isEmpty(left) && isEmpty(right)) {
        if (importStart === -1) {
            importStart = index;
        }
        importEnd = index;
        continue;
    }
    if (isEmpty(left) || isImport(left).hasImport || isExport(left).hasExport) {
        if (importStart === -1) {
            importStart = index;
        }
        importEnd = index;
        console.log('@@import left', index, line);
        continue;  
    }
    if (isEmpty(right) || isImport(right).hasImport || isExport(right).hasExport) {
        if (importStart === -1) {
            importStart = index;
        }
        importEnd = index;   
        console.log('@@import right', index, line);
        continue;
    }
    break;
  }
}

console.log(importStart, importEnd);
