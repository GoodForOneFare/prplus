import {
  clearCurrentFileReviewedLines,
  clearCurrentFileScrutinyLines,
} from './scrutiny';

const oldPalette = document.querySelector('#__prs_command_palette');
if (oldPalette) {
  oldPalette.remove();
}

const paletteList = document.createElement('div');
paletteList.id = '__prs_command_list';

const paletteFileTypes = [
  'deleted',
  'json',
  'svg',
  'test',
  'graphql',
  'css',
  'renamed',
  'JavaScript',
  'TypeScript',
  'viewed',
];

function collapseAll() {
  for (const element of document.querySelectorAll('.js-file.open')) {
    const toggle = element.querySelector('[aria-expanded]') as HTMLElement;
    toggle.click();
  }
}

function expandAll() {
  for (const element of document.querySelectorAll('.js-file:not(.open)')) {
    const toggle = element.querySelector('[aria-expanded]') as HTMLElement;
    toggle.click();
  }
}

function markRenamedFilesAsViewed() {
  const unreviewedRenamedFiles = Array.from(
    document.querySelectorAll(
      '.js-file[data-renamed]:not([data-file-user-viewed=true]) .file-header',
    ),
  );

  for (const renamedFile of unreviewedRenamedFiles) {
    const toggle = renamedFile.querySelector(
      '.js-reviewed-checkbox',
    ) as HTMLElement;
    toggle.click();
  }
}

function markCurrentFileAsViewed() {
  const currentStickyHeader = Array.from(
    document.querySelectorAll(
      '.js-file:not([data-file-user-viewed=true]) .file-header',
    ),
  ).find((header) => header.getBoundingClientRect().y >= 60);

  const toggle = currentStickyHeader.querySelector(
    '.js-reviewed-checkbox',
  ) as HTMLElement;
  toggle.click();
}

function switchToSplitDiff() {
  const checkbox: HTMLInputElement = document.querySelector(
    'input[type=radio][name=diff][value=split]:not([checked])',
  );
  if (checkbox) {
    checkbox.checked = true;
    const whitespaceButton: HTMLElement = document.querySelector(
      '#whitespace-cb ~ button',
    );
    whitespaceButton.click();
  }
}

function switchToUnifiedDiff() {
  const checkbox: HTMLInputElement = document.querySelector(
    'input[type=radio][name=diff][value=unified]:not([checked])',
  );
  if (checkbox) {
    checkbox.checked = true;
    const whitespaceButton: HTMLElement = document.querySelector(
      '#whitespace-cb ~ button',
    );
    whitespaceButton.click();
  }
}

function toggleWhitespace() {
  const [checkbox, submit] = document.querySelectorAll(
    '#whitespace-cb, #whitespace-cb ~ button',
  );
  (checkbox as HTMLInputElement).checked = true;
  (submit as HTMLElement).click();
}

function findByExtension(...extensions) {
  const selectors = extensions
    .map((extension) => `.js-file[data-file-type='.${extension}']`)
    .join(', ');

  return Array.from(document.querySelectorAll(selectors));
}

const fileTypes = [
  {
    match: ['viewed'],
    show() {
      document.body.dataset.showViewed = 'true';
    },
    hide() {
      document.body.dataset.showViewed = 'false';
    },
    find() {
      return Array.from(
        document.querySelectorAll('.js-file[data-file-user-viewed]'),
      );
    },
  },
  {
    match: ['renamed'],
    show() {
      document.body.dataset.showRenamed = 'true';
    },
    hide() {
      document.body.dataset.showRenamed = 'false';
    },
    find() {
      return Array.from(document.querySelectorAll('.js-file[data-renamed]'));
    },
  },
  {
    match: ['TypeScript', 'ts', 'tsx'],
    show() {
      document.body.dataset.showTs = 'true';
    },
    hide() {
      document.body.dataset.showTs = 'false';
    },
    find() {
      return findByExtension('ts', 'tsx');
    },
  },
  {
    match: ['javascript', 'js', 'jsx'],
    show() {
      document.body.dataset.showJs = 'true';
    },
    hide() {
      document.body.dataset.showJs = 'false';
    },
    find() {
      return findByExtension('js', 'jsx');
    },
  },
  {
    match: ['css', 'scss'],
    show() {
      document.body.dataset.showCss = 'true';
    },
    hide() {
      document.body.dataset.showCss = 'false';
    },
    find() {
      return findByExtension('css', 'scss');
    },
  },
  {
    match: ['json'],
    show() {
      document.body.dataset.showJson = 'true';
    },
    hide() {
      document.body.dataset.showJson = 'false';
    },
    find() {
      return findByExtension('json');
    },
  },
  {
    match: ['yml', 'yaml'],
    show() {
      document.body.dataset.showYml = 'true';
    },
    hide() {
      document.body.dataset.showYml = 'false';
    },
    find() {
      return findByExtension('yml', 'yaml');
    },
  },
  {
    match: ['images'],
    show() {
      document.body.dataset.showImages = 'true';
    },
    hide() {
      document.body.dataset.showImages = 'false';
    },
    find() {
      return findByExtension('gif', 'jpg', 'jpeg', 'png', 'svg');
    },
  },
  {
    match: ['graphql'],
    show() {
      document.body.dataset.showGraphql = 'true';
    },
    hide() {
      document.body.dataset.showGraphql = 'false';
    },
    find() {
      return findByExtension('graphql');
    },
  },
  {
    match: 'viewed',
    show() {
      document.body.dataset.showViewed = 'true';
    },
    hide() {
      document.body.dataset.showViewed = 'false';
    },
    find() {
      return Array.from(
        document.querySelectorAll('.js-file[data-file-user-viewed]'),
      );
    },
  },
  {
    match: 'deleted',
    show() {
      document.body.dataset.showDeleted = 'true';
    },
    hide() {
      document.body.dataset.showDeleted = 'false';
    },
    find() {
      return Array.from(
        document.querySelectorAll('.js-file[data-file-deleted=true]'),
      );
    },
  },
  {
    match: 'test',
    show() {
      document.body.dataset.showTests = 'true';
    },
    hide() {
      document.body.dataset.showTests = 'false';
    },
    find() {
      return Array.from(document.querySelectorAll('.js-file[data-test]'));
    },
  },
];

function hideFileType(fileType) {
  const typeData = fileTypes.find((type) => type.match.includes(fileType));
  typeData?.hide();
}

function collapseFileType(fileType) {
  const typeData = fileTypes.find((type) => type.match.includes(fileType));
  typeData
    ?.find()
    .filter((file) => file.classList.contains('open'))
    .forEach((file) => {
      const toggle: HTMLInputElement = file.querySelector('[aria-expanded]');
      toggle.click();
    });
}

function expandFileType(fileType) {
  const typeData = fileTypes.find((type) => type.match.includes(fileType));

  typeData
    ?.find()
    .filter((file) => !file.classList.contains('open'))
    .forEach((file) => {
      const toggle: HTMLInputElement = file.querySelector('[aria-expanded]');
      toggle.click();
    });
}

function showFileType(fileType) {
  const typeData = fileTypes.find((type) => type.match.includes(fileType));
  typeData?.show();
}

function hideComments() {
  document.body.classList.add('__prs_hide_comments');
}

function showComments() {
  document.body.classList.remove('__prs_hide_comments');
}

let commands;
let filteredCommands;
function generateCommands() {
  commands = [
    {
      text: 'Clear current file review lines',
      callback() {
        clearCurrentFileReviewedLines();
      },
    },
    {
      text: 'Clear current file scrutiny',
      callback() {
        clearCurrentFileScrutinyLines();
      },
    },
    {
      text: 'Collapse all',
      callback() {
        collapseAll();
      },
    },
    {
      text: 'Expand all',
      callback() {
        expandAll();
      },
    },
    {
      text: 'Mark as viewed',
      callback() {
        markCurrentFileAsViewed();
      },
    },
    {
      text: 'Mark renamed files as viewed',
      callback() {
        markRenamedFilesAsViewed();
      },
    },
    {
      text: `Toggle whitespace`,
      callback() {
        toggleWhitespace();
      },
    },
    {
      text: 'Switch to unified diff',
      callback() {
        switchToUnifiedDiff();
      },
    },
    {
      text: 'Switch to split diff',
      callback() {
        switchToSplitDiff();
      },
    },
    ...paletteFileTypes.flatMap((fileType) => [
      {
        text: `Collapse ${fileType} files`,
        callback: () => collapseFileType(fileType),
      },
      {
        text: `Expand ${fileType} files`,
        callback: () => expandFileType(fileType),
      },
      {
        text: `Hide ${fileType} files`,
        callback: () => hideFileType(fileType),
      },
      {
        text: `Show ${fileType} files`,
        callback: () => showFileType(fileType),
      },
    ]),
    {text: 'Hide comments', callback: () => hideComments()},
    {text: 'Show comments', callback: () => showComments()},
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

const palette = document.createElement('div');
palette.id = '__prs_command_palette';
palette.appendChild(paletteList);
palette.appendChild(paletteInput);

function selectCurrentCommand() {
  if (filteredCommands.length === 0) {
    return;
  }

  // TODO: I think command.callback will never be set, but I'm hacking around it for a demo.
  const callback =
    filteredCommands[currentCommand].callback ||
    filteredCommands[currentCommand].command.callback;
  callback();
  currentCommand = 0;
  paletteInput.value = '';
  palette.style.display = 'none';

  const commandItems = paletteList.querySelectorAll('li.hidden');

  Array.from(commandItems).forEach((item) => {
    item.classList.remove('hidden');
  });
}

paletteInput.addEventListener('change', (evt) => {
  const target = evt.target as HTMLInputElement;
  if (target.value !== '') {
    selectCurrentCommand();
  }
});

paletteInput.addEventListener('keyup', (evt) => {
  if (evt.code === 'Escape') {
    // Hiding the palette will trigger a `change` event unless its input
    // is returned to its original value.
    paletteInput.value = '';
    evt.preventDefault();
    palette.style.display = 'none';
  } else if (evt.code === 'Enter') {
    selectCurrentCommand();
  }
});

function paletteClearSelectedCommand() {
  const selected = paletteList.querySelector('li.selected');
  if (selected) {
    selected.classList.remove('selected');
  }
}

paletteInput.addEventListener('input', (evt) => {
  const target = evt.target as HTMLInputElement;
  const matches = getMatchingCommands(target.value);
  paletteClearSelectedCommand();
  currentCommand = 0;
  const commandItems = paletteList.querySelectorAll('li');

  Array.from(commandItems).forEach((item, index) => {
    if (matches.find((match) => match.index === index)) {
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

paletteInput.addEventListener('keyup', (evt) => {
  if (evt.code === 'ArrowUp') {
    paletteSetSelectedCommand(currentCommand - 1);
    evt.preventDefault();
  } else if (evt.code === 'ArrowDown') {
    paletteSetSelectedCommand(currentCommand + 1);
    evt.preventDefault();
  }
});

document.addEventListener('keydown', (evt) => {
  if (evt.shiftKey && evt.metaKey) {
    if (evt.code === 'KeyP') {
      palette.style.display = 'flex';
      paletteInput.focus();
      generateCommands();
      filteredCommands = commands;
      currentCommand = 0;
      paletteList.innerHTML = `<ul><li>${commands
        .map(({text}) => text)
        .join('</li><li>')}</li></ul>`;
      paletteList.querySelector('li').classList.add('selected');
      evt.preventDefault();
      return false;
    }
  }

  return true;
});
