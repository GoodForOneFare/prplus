(function() {
  const paletteStyles = document.createElement('style');
  paletteStyles.type = 'text/css';
  paletteStyles.innerHTML = `
    #__prs_command_palette li.hidden{
      display: none;
    }

    #__prs_command_palette li.selected {
      background-color: #aaa;
    }
  `;
  document.head.appendChild(paletteStyles);

  const globalStyles = document.createElement('style');
  globalStyles.type = 'text/css';
  globalStyles.innerHTML = `
    body.__prs_hide_viewed .js-file[data-file-user-viewed] {
      display: none !important;
    }

    body.__prs_hide_comments #files .js-inline-comments-container {
      display: none !important;
    }
  `;

  document.head.appendChild(globalStyles);

  const oldPalette = document.querySelector('#__prs_command_palette');
    if (oldPalette) {
      oldPalette.remove();
    }
  
    const paletteList = document.createElement('div');
    paletteList.id = '__prs_command_list';
  
    const fileTypes = [
      'deleted',
      'json',
      'svg',
      'test',
      'graphql',
      'css',
      'moved',
      'TypeScript',
      'JavaScript',
    ];

    function getReviewStats() {
        const files = document.querySelectorAll("#files .js-file")
            .map((file) => ({
                path: file.querySelector('.js-file-header').dataset.path, 
                viewed: file.dataset.fileUserViewed === 'true',
                removedCount: file.querySelectorAll("td.blob-num-deletion.js-linkable-line-number").length, 
                added: file.querySelectorAll("td.blob-num-addition.js-linkable-line-number").length
            }))
            .reduce((acc, current) => {
                if (current.p.match(/\.test\./)) { 
                    acc.tests.push(current); 
                } else { 
                    acc.app.push(current); 
                } 
                return acc;
            }, {app: [], tests: []});        
    }

    function collapseAll() {
      for (const element of document.querySelectorAll(".js-file.open")) {
        element.querySelector("[aria-expanded]").click();
      }
    }

    function expandAll() {
      for (const element of document.querySelectorAll(".js-file:not(.open)")) {
        element.querySelector("[aria-expanded]").click();
      }
    }

    function markCurrentFileAsViewed() {
      const currentStickyHeader = Array.from(
        document.querySelectorAll(".js-file:not([data-file-user-viewed=true]) .file-header")
      )
        .find((e) => e.getBoundingClientRect().y >= 60);

      currentStickyHeader.querySelector(".js-reviewed-checkbox").click();
    }

    function getDevMocks() {
        const devMocks = document.querySelectorAll('.js-file .file-header');
        return Array.from(devMocks)
          .filter((header) => header.dataset.path.startsWith('dev/'))
          .map((header) => header.closest('.js-file'));
    }

    function hideDevMocks() {
        const devMocks = getDevMocks();
        Array.from(devMocks).forEach((element) => {
            element.style.display = 'none';
        });   
    }

    function showDevMocks() {
        const devMocks = getDevMocks();
        Array.from(devMocks).forEach((element) => {
            element.style.display = '';
        });   
    }

    function switchToSplitDiff() {
      const checkbox = document.querySelector("input[type=radio][name=diff][value=split]:not([checked])");
      if (checkbox) {
        checkbox.checked = true
        document.querySelector('#whitespace-cb ~ button').click();
      }
    }

    function switchToUnifiedDiff() {
      const checkbox = document.querySelector("input[type=radio][name=diff][value=unified]:not([checked])");
      if (checkbox) {
        checkbox.checked = true
        document.querySelector('#whitespace-cb ~ button').click();
      }
    }

    function toggleWhitespace() {
        const [checkbox, submit] = document.querySelectorAll("#whitespace-cb, #whitespace-cb ~ button");
        checkbox.checked = true
        submit.click();
    }
    function startFocusMode() {
        const focusStyles = document.createElement('style');
        focusStyles.dataset.prsFocusStyles = true;
        focusStyles.type = 'text/css';
        focusStyles.innerHTML = `
          #partial-discussion-header,
          .js-header-wrapper,
          .repohead,
          .tabnav-pr,
          .js-diffbar-commits-menu,
          .js-file-filter,
          .js-reset-filters,
          .toc-select.select-menu {
            display: none !important;
          }
          [data-file-user-viewed] {
            display: none !important;
          }
          [data-file-deleted=true] {
            display: none !important;
          }
        `;
        document.head.appendChild(focusStyles);
        // document.querySelector('.js-header-wrapper').style.display = 'none';
        // document.querySelector('.repohead').style.display = 'none';
        // document.querySelector('#partial-discussion-header').style.display = 'none';
        // document.querySelector('.tabnav-pr').style.display = 'none';
        // document.querySelector(".js-diffbar-commits-menu").style.display = 'none';
        // document.querySelector(".js-file-filter").style.setProperty('display', 'none', 'important')
        // document.querySelector(".js-reset-filters").style.setProperty('display', 'none', 'important')
        // document.querySelector(".toc-select.select-menu").style.setProperty('display', 'none', 'important')

        hideDevMocks();
        hideFileType('json');
        hideFileType('test');
        // hideFileType('deleted');
    }

    function stopFocusMode() {
      const styles = document.querySelector('[data-prs-focus-styles=true]');
      if (styles) {
        styles.remove();
      }
        // document.querySelector('.js-header-wrapper').style.display = '';
        // document.querySelector('.repohead').style.display = '';
        // document.querySelector('#partial-discussion-header').style.display = '';
        // document.querySelector('.tabnav-pr').style.display = '';
        // document.querySelector(".js-diffbar-commits-menu").style.display = '';
        // document.querySelector(".js-file-filter").style.display = '';
        // document.querySelector(".js-reset-filters").style.display = '';
        // document.querySelector(".toc-select.select-menu").style.setProperty('display', '')

        showDevMocks();
        showFileType('json');
        showFileType('test');
        showFileType('deleted');
    }

    function getFilesByType(fileType) {
      let elements = [];

      if (fileType === 'test') {
        const headers = document.querySelectorAll('.js-file .file-header');
        elements = Array.from(headers)
          .filter((header) => header.dataset.path.match(/\.test\.[jt]sx?$/))
          .map((header) => header.closest('.js-file'));
      } else if (fileType === 'deleted') {
        elements = document.querySelectorAll('.js-file[data-file-deleted=true]');
      } else if (fileType === 'moved') {
        throw new Error('moved files not supported');
      } else if (fileType === 'viewed') {
        elements = document.querySelectorAll('.js-file[data-file-user-viewed]');        
      } else {
        if (fileType === 'TypeScript') {
          fileType = 'ts';
        } else if (fileType === 'JavaScript') {
          fileType = 'js';
        }

        elements = [
          ...Array.from(
            fileType === 'js' || fileType === 'ts'
              ? document.querySelectorAll(
                  `.js-file[data-file-type='.${fileType}x`,
                )
              : [],
          ),
          ...Array.from(
            document.querySelectorAll(`.js-file[data-file-type='.${fileType}`),
          ),
        ];
      }
  
      return elements;
    }
  
    function hideFileType(fileType) {
      Array.from(getFilesByType(fileType)).forEach((element) => {
        element.style.display = 'none';
      });
    }

    function collapseFileType(fileType) {
      Array.from(getFilesByType(fileType))
        .filter((file) => file.classList.contains('open'))
        .forEach((file) => {
          file.querySelector("[aria-expanded]").click();
        });      
    }

    function expandFileType(fileType) {
      Array.from(getFilesByType(fileType))
        .filter((file) => !file.classList.contains('open'))
        .forEach((file) => {
          file.querySelector("[aria-expanded]").click();
        });      
    }

    function showFileType(fileType) {
      getFilesByType(fileType).forEach((element) => {
        element.style.display = 'block';
      });
    }
  
    function getComponents() {
      const elements = document.querySelectorAll(
        [
          '.js-file .file-header[data-path*="/components/"]',
          '.js-file .file-header[data-path^="/app/steps/"]',
          '.js-file .file-header[data-path^="/app/foundation/"]',
        ].join(','),
      );
  
      const componentNames = Array.from(elements)
        .map((element) => getComponentNameFromPath(element))
        .filter(Boolean);
  
      return Array.from(new Set(componentNames.sort()));
    }
  
    function getComponentNameFromPath(element) {
      const path = element.dataset.path;
      if (
        path.match(/[/]components[/]/) ||
        path.match(/app[/]foundation[/]/) ||
        path.match(/app[/]steps[/]/)
      ) {
        // Remove "before the component's dir name" segments
        const relativeComponentPath = path.replace(
          /.*(foundation|steps|components)[/](.+)/,
          '$2',
        );
        const componentName = relativeComponentPath.split('/')[0];
        // Anything that doesn't start with a capital letter is an index.ts file, or something not component-related.
        const isComponent = componentName.match(/^[A-Z]/);
        if (isComponent) {
          return componentName;
        }
      }
      return false;
    }
  
    function focusComponent(componentName) {
      const elements = document.querySelectorAll(
        ['.js-file .file-header'].join(','),
      );
  
      Array.from(elements).forEach((element) => {
        if (getComponentNameFromPath(element) === componentName) {
          element.closest('.js-file').style.display = '';
        } else {
          element.closest('.js-file').style.display = 'none';
        }
      });
    }
  
    function hideComponent(componentName) {
      const elements = document.querySelectorAll(
        ['.js-file .file-header'].join(','),
      );
  
      Array.from(elements).forEach((element) => {
        if (getComponentNameFromPath(element) === componentName) {
          element.closest('.js-file').style.display = 'none';
        }
      });
    }
  
    function collapseComponent(componentName) {
      const elements = document.querySelectorAll(
        ['.js-file .file-header'].join(','),
      );
  
      Array.from(elements).forEach((element) => {
        if (getComponentNameFromPath(element) === componentName) {
          const expandButton = element.querySelector(
            '.file-info button[aria-expanded=true]',
          );
          if (expandButton) {
            expandButton.click();
          }
        }
      });
    }
  
    function expandComponent(componentName) {
      const elements = document.querySelectorAll(
        ['.js-file .file-header'].join(','),
      );
  
      Array.from(elements).forEach((element) => {
        if (getComponentNameFromPath(element) === componentName) {
          const expandButton = element.querySelector(
            '.file-info button[aria-expanded=false]',
          );
          if (expandButton) {
            expandButton.click();
          }
        }
      });
    }
  
    function hideComments() {
      document.body.classList.add('__prs_hide_comments');
    }
  
    function showComments() {
      document.body.classList.remove('__prs_hide_comments');
    }
  
    function hideViewedFiles() {
      document.body.classList.add('__prs_hide_viewed');
    }

    function showViewedFiles() {
      document.body.classList.remove('__prs_hide_viewed');
    }

    let commands;
    let filteredCommands;
    function generateCommands() {
        commands = [
            {text: 'Clear current file review lines', callback() {
              window.__prs__shared.clearCurrentFileReviewedLines();
            }},
            {text: 'Clear current file scrutiny', callback() {
              window.__prs__shared.clearCurrentFileScrutinyLines();
            }},
            {text: 'Collapse all', callback() { collapseAll() }},
            {text: 'Expand all', callback() { expandAll() }},
            {text: 'Mark as viewed', callback() { markCurrentFileAsViewed() }},
            {text: `Toggle whitespace`, callback() { toggleWhitespace() }},
            {text: 'Switch to unified diff', callback() { switchToUnifiedDiff() }},
            {text: 'Switch to split diff', callback() { switchToSplitDiff() }},
            ...fileTypes.flatMap((fileType) => [
                {
                text: `Collapse ${fileType} files`,
                callback: () => collapseFileType(fileType),
                },
                {
                text: `Expand ${fileType} files`,
                callback: () => expandFileType(fileType),
                },
                {text: `Hide ${fileType} files`, callback: () => hideFileType(fileType)},
                {text: `Show ${fileType} files`, callback: () => showFileType(fileType)},
            ]),
            {text: 'Hide test files', callback: () => hideFileType('test')},
            ...getComponents().flatMap((componentName) => [
                {
                text: `Focus ${componentName}`,
                callback: () => focusComponent(componentName),
                },
                {
                text: `Hide ${componentName}`,
                callback: () => hideComponent(componentName),
                },
                {
                text: `Collapse ${componentName}`,
                callback: () => collapseComponent(componentName),
                },
                {
                text: `Expand ${componentName}`,
                callback: () => expandComponent(componentName),
                },
            ]),
            {text: 'Hide viewed files', callback: () => hideViewedFiles()},
            {text: 'Show viewed files', callback: () => showViewedFiles()},
            {text: 'Expand viewed files', callback: () => expandFileType('viewed')},
            {text: 'Collapse viewed files', callback: () => collapseFileType('viewed')},
            {text: 'Hide comments', callback: () => hideComments()},
            {text: 'Show comments', callback: () => showComments()},
            {text: 'Hide dev setup', callback: () => hideDevMocks()},
            {text: 'Show dev setup', callback: () => showDevMocks()},
            {text: 'Start focus mode', callback: () => startFocusMode()},
            {text: 'Stop focus mode', callback: () => stopFocusMode()},
        ].sort();
    }

    paletteList.style.overflowY = 'scroll';
    paletteList.style.height = '150px';
  
    const paletteInput = document.createElement('input');
    paletteInput.type = 'text';
    paletteInput.style.flex = '1 1 auto';
  
    let currentCommand = 0;
    function getMatchingCommands(rawFilterText) {
      const filterText = rawFilterText.toUpperCase();
      filteredCommands = commands.reduce((acc, command, index) => {
        if (command.text.toUpperCase().includes(filterText)) {
          acc.push({index, command});
        }
        return acc;
      }, []);

      currentCommand = 0;

      return filteredCommands;
    }
    
    function selectCurrentCommand() {
      if (filteredCommands.length === 0) {
        return;
      }

      // TODO: I think command.callback will never be set, but I'm hacking around it for a demo.
      const callback = filteredCommands[currentCommand].callback || filteredCommands[currentCommand].command.callback;
      callback();
      currentCommand = 0;
      paletteInput.value = '';
      palette.style.display = 'none';
  
      const commandItems = paletteList.querySelectorAll('li.hidden');
  
      Array.from(commandItems).forEach((item) => {
        item.classList.remove('hidden');
      });
    }

    paletteInput.addEventListener('change', (e) => {
      if (e.target.value !== '') {
        selectCurrentCommand();
      }
    });
    paletteInput.addEventListener('keyup', (e) => {
      if (e.code === 'Escape') {
        // Hiding the palette will trigger a `change` event unless its input
        // is returned to its original value.
        paletteInput.value = '';
        e.preventDefault();
        palette.style.display = 'none';
      } else if (e.code === 'Enter') {
        selectCurrentCommand();
      }
    });
  
    function paletteClearSelectedCommand() {
      const selected = paletteList.querySelector('li.selected');
      if (selected) {
        selected.classList.remove('selected');
      }
    }

    paletteInput.addEventListener('input', (e) => {
      const matches = getMatchingCommands(e.target.value);
      paletteClearSelectedCommand();
      currentCommand = 0;
      const commandItems = paletteList.querySelectorAll('li');
  
      Array.from(commandItems).forEach((item, index) => {
        if (matches.find((m) => m.index === index)) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
      });
      const firstItem = paletteList.querySelector('li:not(.hidden)');
      if (firstItem) {
        firstItem.classList.add('selected');
      }
    });
  
    const palette = document.createElement('div');
    palette.id = '__prs_command_palette';
    palette.style.position = 'fixed';
    palette.style.bottom = 0;
    palette.style.right = 0;
    palette.style.width = '400px';
    palette.style.padding = '10px 5px';
    palette.style.background = '#ddd';
    palette.style.display = 'none';
    palette.style.flexDirection = 'column';
    palette.style.zIndex = 9000;
  
    palette.appendChild(paletteList);
    palette.appendChild(paletteInput);
  
    document.body.appendChild(palette);
  
    paletteInput.focus();
  
    function paletteSetSelectedCommand(newCommandIndex) {
      const commandItems = paletteList.querySelectorAll('li:not(.hidden)');        
      if (commandItems.length === 0) {
        return;
      }

      commandItems[currentCommand].classList.remove('selected');
      if (newCommandIndex > currentCommand) {
        currentCommand = Math.min(newCommandIndex, filteredCommands.length - 1);
      } else {
        currentCommand = Math.max(newCommandIndex, 0);
      }
      commandItems[currentCommand].classList.add('selected');
    }

    paletteInput.addEventListener('keyup', (e) => {
      if (e.code === 'ArrowUp') {
        paletteSetSelectedCommand(currentCommand - 1);
        e.preventDefault();
      } else if (e.code === 'ArrowDown') {
        paletteSetSelectedCommand(currentCommand + 1);
        e.preventDefault();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.shiftKey && e.metaKey) {
        if (e.code === 'KeyP') {
          palette.style.display = 'flex';
          paletteInput.focus();
          generateCommands();
          filteredCommands = commands;
          currentCommand = 0;
          paletteList.innerHTML = `<ul><li>${commands
            .map(({text}) => text)
            .join('</li><li>')}</li></ul>`;      
            paletteList.querySelector('li').classList.add('selected');
          e.preventDefault();
          return false;    
        }
      }
  
      return true;
    });    
  })();
  