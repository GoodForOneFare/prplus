function hideTestFiles() {
    console.log("@@hideTestFiles");
    Array.from(document.querySelectorAll(".file a[title$=\\.test\\.ts], .file a[title$=\\.test\\.tsx]"))
      .map((link) => link.closest('.file')
      .querySelector('[aria-expanded=true]'))
      .filter(Boolean)
      .forEach((collapseButton) => collapseButton.click());
}

function hideTranslationFiles() {
    const files = Array.from(
        document.querySelectorAll('.file[data-file-type=".json"] *[data-path*="/translations/"]')
    ).map((header) => header.closest('.file'));
    files.forEach((file) => file.remove());
}
function hideGraphQLFiles() {
    const files = Array.from(document.querySelectorAll('[data-file-type=".graphql"]'));
    files.forEach((file) => file.remove());
}
function hideCSSFiles() {
    const files = Array.from(document.querySelectorAll('[data-file-type=".css"],[data-file-type=".scss"]'));
    files.forEach((file) => file.remove());
}
function removeDeletedFiles() {
    const files = Array.from(document.querySelectorAll('[data-file-deleted=true]'));
    files.forEach((file) => file.remove());
}

function isRemoveableIndexFile(file) {
    function isRemovableLine(element) {
        const text = element.innerText;
        if (!text || !text.trim()) {
            return true;
        }

        if (text.startsWith('import ')) {
            return true;
        }
        
        if (text.startsWith('export ')) {
            return !text.startsWith('export function');
        }
        return true;
    }
    
    const table = file.querySelector('.js-diff-table');
    const lines = table.querySelectorAll('tr');

    const allRemoveable = Array.from(lines).every((line) => {
        if (line.dataset.position != null) {    
            console.log('@@hunk')
            return true;
        } else if (line.classList.contains("inline-comments")) {
            console.log('@@comment')
            return true;
        } else {
            const [left, right] = Array.from(
                Array.from(
                    file.querySelectorAll('.blob-code-deletion, .blob-code-addition, .blob-code-context, .blob-code-empty')
                    ).map((line) => line.parentElement)                    
                    );
            const isLeftImportRemovable = isRemovableLine(left);
            const isRightImportRemovable = isRemovableLine(right);
            console.log('@@pairs', isLeftImportRemovable, isRightImportRemovable);
            return isLeftImportRemovable && isRightImportRemovable;            
        }
    });
 
    console.log("@@allRemoveable", allRemoveable);
    return allRemoveable;
    /*if (file.querySelectorAll('.blob-code-deletion, .blob-code-addition, .blob-code-context, .blob-code-empty').length === 0) {
        file.remove();
        // file.style.backgroundColor = 'red';
    } else {
        // console.log('@@file still has', file.querySelectorAll('.blob-code-deletion, .blob-code-addition, .blob-code-context, .blob-code-empty'))
    }*/
}

function removeIndexFileChurn() {
    // const files = Array.from(document.querySelectorAll('[data-file-deleted=true]'));

    // const lines = .blob-code-deletion, .blob-code-addition, '.blob-code-context'
    const files = Array.from(
        document.querySelectorAll([
            '.file[data-file-type=".ts"] .file-header[data-path$="/index.ts"]',
            '.file[data-file-type=".tsx"] .file-header[data-path$="/index.tsx]',
        ].join(','))    
    ).map((header) => header.closest('.file'))
    .filter((file) => file.dataset.fileDeleted !== 'true');

    files.forEach((file) => {
        console.log("@@file", file);
        const allRemoveable = isRemoveableIndexFile(file)
        if (allRemoveable) {
            file.remove();
        }
    });
}

function removeImportExportLines() {
}

function removeComments() {
    const comments = Array.from(document.querySelectorAll('.js-inline-comments-container'));
    comments.forEach((comment) => {
        comment.remove();
    });
}

function removeViewed() {
  Array.from(document.querySelectorAll(".js-reviewed-file"))
    .map((checkbox) => checkbox.closest('.file'))
    .forEach((file) => file.remove());
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log("!!!received!!!", request, "//")
    //   console.log(sender.tab ?
    //               "from a content script:" + sender.tab.url :
    //               "from the extension");
        switch (request.type) {
            case 'hideTestFiles':
                hideTestFiles();
                break;
            case 'removeDeletedFiles':
                removeDeletedFiles();
                break;

            case 'hideTranslationFiles':
                hideTranslationFiles();
                break;
            case 'hideGraphQLFiles':
                hideGraphQLFiles();
                break;
            case 'hideCSSFiles':
                hideCSSFiles();
                break;
            case 'removeDeletedFiles':
                removeDeletedFiles();
                break;
            case 'removeIndexFileChurn':
                removeIndexFileChurn();
                break;
            case 'removeImportExportLines':
                removeImportExportLines();
                break;
            case 'removeComments':
                removeComments();
                break;
            case 'removeViewed':
                removeViewed();
                break;
        }
    }
);
