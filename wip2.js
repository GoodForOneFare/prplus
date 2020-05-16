(function() {
  // const isFilesView = document.querySelector("nav.tabnav-tabs .tabnav-tab.selected[href*='/files']") !== null;
  let prs;
  if (window.localStorage.__prs) {
    prs = JSON.parse(window.localStorage.__prs);
  } else {
    prs = {};
  }

  
  // positionScrutinyOverlay = (td) => {
  //   const overlay = document.querySelector('.scrutiny-overlay');
  //   const lineTd = td.nextElementSibling;
  //   overlay.style.top = (td.parentElement.offsetTop + overlay.offsetHeight + overlay.offsetHeight) + "px";
  //   overlay.style.left = (lineTd.offsetLeft + lineTd.offsetWidth - overlay.offsetWidth) + "px";
  // }

  function aaa() {
      const facts = Array.from(document.querySelectorAll('.js-file .file-header'))
        .map((header) => {
          const file = header.closest('.js-file');
          if (!header.dataset.path) {
            console.log("@@no type", header);
          }
          const type = /\b[/.]test/.test(header.dataset.path)
            ? 'test'
            : header.dataset.fileType
                .replace(/^[.]/, '')
                .replace(/([jt])sx$/, '$1s');

          return {
            type,
            viewed: file.dataset.fileUserViewed != undefined,
            deleted: file.dataset.fileDeleted === 'true',
            open: file.classList.contains('open'),
          };
        })
        .sort((a, b) => {
          if (a.type < b.type) {
            return -1;
          } else if (a.type > b.type) {
            return 1;
          } else {
            return 0;
          }
        })
        .reduce((acc, {type, ...attrs}) => {
          if (!acc[type]) {
            acc[type] = {type, total: 0, viewed: 0, deleted: 0, open: 0};
          }
          ++acc[type].total;
          if (attrs.viewed) {
            ++acc[type].viewed;
          }
          if (attrs.deleted) {
            ++acc[type].deleted;
          }
          if (attrs.open) {
            ++acc[type].open;
          }
    
          return acc;
        }, {});
    
      let factsHtml = document.querySelector('#facts');
      if (!factsHtml) {
        factsHtml = document.createElement('div');
        factsHtml.id = 'facts';
        const defaultProgressBar = document.querySelector('.pr-review-tools .diffbar-item progress-bar');
        if (defaultProgressBar) {
          defaultProgressBar.style.display = 'none';
          defaultProgressBar.parentElement.appendChild(factsHtml);
        }
      }
      factsHtml.innerHTML = Object.entries(facts)
        .map(([key, {viewed, total}]) => {
          return viewed === total
            ? `${key}: ✅`
            : `${key}: ${viewed} / ${total}`;
        })
        .join(', ');
    }
    
    document.body.removeEventListener('click', aaa);
    document.body.addEventListener('click', () => {
      setTimeout(aaa, 500);
    });
    
    aaa();
    initialScrutinizedLines();

    function lineIds(trOrTd) {
      const {tagName} = trOrTd;
      const tr = tagName === 'tr' ? trOrTd : trOrTd.closest('tr');
    
      return Array.from(tr.querySelectorAll("[id^='diff-'")).map(({id}) => id);
    };
    
    function isLineReviewed(file, tr) {
      const prId = window.location.pathname.replace(/(.+[/]pull[/]\d+).*/, '$1');
      const pr = prs[prId];
      if (!pr) {
        return false;
      }
    
      const filePath = tr.closest('.js-file').querySelector('.file-header').dataset
        .path;
      const fileInfo = pr.files[filePath];
      if (!fileInfo) {
        return false;
      }
    
      const lines = fileInfo.lines;
      return lines[lineIds(tr).join('-')] === true;
    };
    
    const styleOverridesReview = document.createElement('style');
    styleOverridesReview.type = 'text/css';
    styleOverridesReview.innerHTML = `

      .toolbar-branch-name {
        display: none;
        margin-left: 0.5cm;
      }
      
      .pr-toolbar.is-stuck .toolbar-branch-name {
        display: inline;
      }

      .prs--reviewed {
        background-color: inherit;
      }

      .blob-num-addition.prs--reviewed {
        border-right: 1px solid green;
      }

      .blob-num-deletion.prs--reviewed {
        border-right: 1px solid red;
      }

      .blob-code-addition.prs--reviewed {
        
      }

      .blob-code-deletion.prs--reviewed {
        
      }

      .__prs--scrutinize.blob-num {
        border-left: 2px solid red !important;
      }

      .__prs--scrutinize.__prs--scrutinize--top.blob-num {
        border-top: 2px solid red !important;
      }

      .__prs--scrutinize.__prs--scrutinize--bottom.blob-num {
        border-bottom: 2px solid red !important;
      }

      .__prs--scrutinize.blob-num + .blob-code {
        border-right: 2px solid red !important;
      }

      .__prs--scrutinize.__prs--scrutinize--top.blob-num + .blob-code {
        border-top: 2px solid red !important;
      }

      .__prs--scrutinize.__prs--scrutinize--top.blob-num + .blob-code::after {
        border: none;
        content: '🔺';
        display: flex;
        font-size: 30pt;
        justify-content: flex-end;
        margin: 5px;
      }

      .__prs--scrutinize.__prs--scrutinize--bottom.blob-num + .blob-code {
        border-bottom: 2px solid red !important;
      }
    `;

    document.head.appendChild(styleOverridesReview);

    function clearCurrentFileScrutinyLines() {
      const currentStickyHeader = Array.from(
        document.querySelectorAll(".js-file:not([data-file-user-viewed=true]) .file-header")
      )
        .find((e) => e.getBoundingClientRect().y >= 60);

      if (currentStickyHeader) {
        const prId = window.location.pathname.replace(/(.+[/]pull[/]\d+).*/, '$1');
        const pr = prs[prId];
        if (!pr) {
          console.log('@@no pr', prId);
          return;
        }
        
        const filePath = currentStickyHeader.dataset.path;
        if (pr.files[filePath]) {
          pr.files[filePath].scrutinyBlocks = [];
        }
      
        const fileElement = currentStickyHeader.closest('.file');
        for (const reviewedElement of fileElement.querySelectorAll('.__prs--scrutinize')) {
          reviewedElement.classList.remove('__prs--scrutinize', '__prs--scrutinize--top', '__prs--scrutinize--bottom');
        }
        window.localStorage.__prs = JSON.stringify(prs);
      }
    }

    function clearCurrentFileReviewedLines() {
      const currentStickyHeader = Array.from(
        document.querySelectorAll(".js-file:not([data-file-user-viewed=true]) .file-header")
      )
        .find((e) => e.getBoundingClientRect().y >= 60);

      if (currentStickyHeader) {
        const prId = window.location.pathname.replace(/(.+[/]pull[/]\d+).*/, '$1');
        const pr = prs[prId];
        if (!pr) {
          console.log('@@no pr', prId);
          return;
        }
        
        const filePath = currentStickyHeader.dataset.path;
        if (pr.files[filePath]) {
          pr.files[filePath].lines = {};
        }
      
        const fileElement = currentStickyHeader.closest('.file');
        for (const reviewedElement of fileElement.querySelectorAll('.prs--reviewed')) {
          reviewedElement.classList.remove('prs--reviewed');
        }
        window.localStorage.__prs = JSON.stringify(prs);
      }
    }

    window.__prs__shared = {};
    window.__prs__shared.clearCurrentFileScrutinyLines = clearCurrentFileScrutinyLines;
    window.__prs__shared.clearCurrentFileReviewedLines = clearCurrentFileReviewedLines;

    function updateHeader(file) {
      const [additions, deletions, reviewedAdditions, reviewedDeletions] = [
        file.querySelectorAll('.blob-num-addition').length,
        file.querySelectorAll('.blob-num-deletion').length,
        file.querySelectorAll('.blob-num-addition.prs--reviewed').length,
        file.querySelectorAll('.blob-num-deletion.prs--reviewed').length,
      ];

      const container = file.querySelector('.file-header .file-actions')
      let progress = container.querySelector('.prs--review-progress');
      if (!progress) {
        container.style.display = 'flex';
        container.style.alignItems = 'center';

        progress = document.createElement('div');
        progress.classList.add('prs--review-progress');
        container.prepend(progress);
      }
      
      const addedProgress = additions ? Math.floor((reviewedAdditions / additions) * 100)  + '%' : '-';
      const deletionProgress = deletions ? Math.floor((reviewedDeletions / deletions) * 100) + '%' : '-';
      progress.innerHTML = `
        ${addedProgress}, ${deletionProgress}
      `;      
    }

    function markScrutinizedLines(numberBoxes) {
      const prId = window.location.pathname.replace(/(.+[/]pull[/]\d+).*/, '$1');
      let pr = prs[prId];
      if (!pr) {
        pr = {files: {}};
        prs[prId] = pr;
      }
    
      const file = numberBoxes[0].closest('.js-file');
      const filePath = file.querySelector('.file-header').dataset
        .path;
      let fileInfo = pr.files[filePath];
      if (!fileInfo) {
        fileInfo = {lines: {}, scrutinyBlocks: []};
        pr.files[filePath] = fileInfo;
      }
    
      if (!fileInfo.scrutinyBlocks) {
        fileInfo.scrutinyBlocks = [];
      }

      const side = numberBoxes[0].id.replace(/.+([RL])\d+$/, '$1');
      const lineNumbers = Array.from(numberBoxes)
        .map(({id}) => id)
        .map((id) => id.replace(/.+[RL](\d+)$/, '$1'));
      const blockInfo = {filePath, side, lineNumbers};
      fileInfo.scrutinyBlocks.push(blockInfo);

      console.log(fileInfo.scrutinyBlocks);
      window.localStorage.__prs = JSON.stringify(prs);
      
      updateScrutinizedUI(blockInfo);
    };

    function updateScrutinizedUI(blockInfo) {
      const fileHeader = document.querySelector(`.js-file .file-header[data-path='${blockInfo.filePath}']`);
      console.log("@@fileHeader", fileHeader);
      if (!fileHeader) {
        return;
      }

      const lineSelectors = blockInfo.lineNumbers.map((line) => `td[id$="${blockInfo.side}${line}"]`).join(", ");
      const lineElements = Array.from(
        fileHeader
          .closest('.js-file')
          .querySelectorAll(lineSelectors)
      );

      Array.from(lineElements).forEach((element) => {
        element.classList.add('__prs--scrutinize');
      });    
      const firstBox = lineElements.shift();
      const lastBox = lineElements.pop() || firstBox;
      firstBox.classList.add('__prs--scrutinize--top');
      lastBox.classList.add('__prs--scrutinize--bottom');

      // const idBlocks = Array.from(new Set(ids))
      //   .map((id) => ({id, number: Number(id.replace(/.+R(\d+)$/, '$1'))}))
      //   .sort()
      //   .reduce((blocks, currentRow) => {
      //     const lastBlock = blocks[blocks.length - 1]; 
      //     const lastRow = lastBlock && lastBlock[lastBlock.length - 1]; 
      //     if (lastRow && lastRow+1 === currentRow) {
      //       lastBlock.push(currentRow);
      //     } else {
      //       blocks.push([currentRow]);
      //     }; 
      //     return blocks; 
      //   }, []);

      //   debugger;
      //   idBlocks.forEach((blockIds) => {
      //     const boxesSelector = blockIds.map((id) => `#${id}`).join(', ');
      //     const numberBoxes = Array.from(document.querySelectorAll(boxesSelector));
      //     if (numberBoxes.length > 0) {
      //       Array.from(numberBoxes).forEach((element) => {
      //         element.classList.add('__prs--scrutinize');
      //       });    
      //       const firstBox = numberBoxes.shift();
      //       const lastBox = numberBoxes.pop() || firstBox;
      //       firstBox.classList.add('__prs--scrutinize--top');
      //       lastBox.classList.add('__prs--scrutinize--bottom');
      //     }
      //   });
    }


    function markReviewedLines(trs, options) {
      const prId = window.location.pathname.replace(/(.+[/]pull[/]\d+).*/, '$1');
      let pr = prs[prId];
      if (!pr) {
        pr = {files: {}};
        prs[prId] = pr;
      }
    
      const [firstTr] = trs;
      const file = firstTr.closest('.js-file')
      const filePath = file.querySelector('.file-header').dataset
        .path;
      let fileInfo = pr.files[filePath];
      if (!fileInfo) {
        fileInfo = {lines: {}};
        pr.files[filePath] = fileInfo;
      }
    
      const lines = fileInfo.lines;
      trs.forEach((tr) => {
        const reviewLineKey = lineIds(tr).join('-');
        lines[reviewLineKey] = true;

        if (options && options.updateUI) {
          Array.from(
            tr.querySelectorAll(
              '.blob-num-addition, .blob-code-addition, .blob-num-deletion, .blob-code-deletion',
            ),
          ).forEach((child) => {
            child.classList.add('prs--reviewed');
          });  
        }
      });

      window.localStorage.__prs = JSON.stringify(prs);
      
      updateHeader(file);
    };
    
    document.body.addEventListener('click', (e) => {
      if (!e.metaKey) {
        return;
      }
      if (
        e.target.classList.contains('blob-num-addition') ||
        e.target.classList.contains('blob-num-deletion')
      ) {
        if (e.altKey) {
          
        } else {
          e.preventDefault();
          const tr = e.target.closest('tr');
        
          markReviewedLines([tr], {updateUI: true});
        }        
      }
    });
    
    let isDragging = false;
    document.addEventListener('mousedown', (e) => { 
        if (!e.metaKey) {
            return;
        }
        isDragging = e.target.tagName === 'TD' && e.target.classList.contains('blob-num');
    });
    
    document.addEventListener('mouseup', (e) => { 
        if (!isDragging) {
            return;
        }
    
        isDragging = false;
        if (!e.metaKey) {
            return;
        }
        
        if (e.altKey) {
          if (e.target.tagName !== 'TD') {
            return;
          }

          const side = e.target.id.replace(/.+([RL])\d+$/, "$1");
          const numberBoxes = Array.from(document.querySelectorAll(`.blob-num.selected-line[id*=${side}]`));

          // const codeLines = Array.from(document.querySelectorAll('.blob-code.selected-line'));
          
          markScrutinizedLines(numberBoxes);
        } else {
          const trs = Array.from(document.querySelectorAll('.blob-num.selected-line'))
          .map((line) => line.closest('tr'));
          
          markReviewedLines(trs, {updateUI: true});        
        }
    })

    function initialScrutinizedLines() {
      const prId = window.location.pathname.replace(/(.+[/]pull[/]\d+).*/, '$1');
      const pr = prs[prId];
      if (!pr) {
        console.log('@@no pr', prId);
        return;
      }
    
      Object.values(pr.files).forEach((file) => {
        file.scrutinyBlocks?.forEach((scrutinyBlock) => {
          updateScrutinizedUI(scrutinyBlock);
        })
      });
    }

    function unhighlightReviewedLines() {
      const prId = window.location.pathname.replace(/(.+[/]pull[/]\d+).*/, '$1');
      const pr = prs[prId];
      if (!pr) {
        console.log('@@no pr', prId);
        return;
      }
    
      Object.keys(pr.files).forEach((filePath) => {
        const fileHeader = document.querySelector(`.file-header[data-path="${filePath}"]`);
        if (!fileHeader) {
          return;
        }
        const file = fileHeader.closest('.js-file');
        const fileInfo = pr.files[filePath];
        if (!fileInfo) {
          return;
        }
    
        const lines = fileInfo.lines;
        Array.from(
          file.querySelectorAll(
            '.blob-num-addition, .blob-code-addition, .blob-num-deletion, .blob-code-deletion',
          ),
        ).forEach((child) => {
          const tr = child.closest('tr');
          const reviewLineKey = lineIds(tr).join('-');
    
          if (lines[reviewLineKey] === true) {
            child.classList.add('prs--reviewed');
          }
        });
      });
    };
  
    function updateToolbar() {
      const branchName = document.querySelector(".head-ref");
      if (!branchName) {
        return;
      }

      document.querySelector('.toolbar-branch-name')?.remove();

      const toolbarBranchName = document.createElement('span');
      toolbarBranchName.classList.add('toolbar-branch-name');
      toolbarBranchName.innerHTML = branchName.outerHTML;      
      toolbarBranchName.querySelector('.css-truncate-target').classList.remove('css-truncate-target');
      toolbarBranchName.addEventListener('click', async (evt) => {
        navigator.clipboard.writeText(toolbarBranchName.innerText);
        evt.preventDefault();
      });
        
      const toolbarPRNumber = document.querySelector(".pr-toolbar .gh-header-number, .gh-header .gh-header-number");
      toolbarPRNumber.appendChild(toolbarBranchName);
    }

    updateToolbar();
  
    (function defaltFilesTabToWhitespace() {
      const filesTab = document.querySelector("a.tabnav-tab[href$=files]");
      if (filesTab) {
        filesTab.href+= "?w=1";
      }
    })();

    function initializeFilesTab() {
      const isFilesView = document.querySelector("nav.tabnav-tabs .tabnav-tab.selected[href*='/files']") !== null;
      if (!isFilesView) {
        return;
      }

      aaa();
      unhighlightReviewedLines();
    
      const filesObserver = new MutationObserver((...args) => {
        aaa();
        initialScrutinizedLines();
        unhighlightReviewedLines();
      });
      
      filesObserver.observe(document.querySelector('#files'), {
        childList: true,
        subtree: true,
      });
    }

    const tabObserver = new MutationObserver((...args) => {
      const isFilesView = document.querySelector("nav.tabnav-tabs .tabnav-tab.selected[href*='/files']") !== null;

      if (isFilesView) {
        initializeFilesTab();
      }
    });
    
    tabObserver.observe(document.querySelector('main'), {
      childList: true,
      subtree: false,
    });

    initializeFilesTab();
})();