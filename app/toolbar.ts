interface TypeSummary {
  type: string;
  total: number;
  viewed: number;
  deleted: number;
  open: number;
}

type Summary = Record<string, TypeSummary>;

export function switchToSplitDiff() {
  const checkbox = document.querySelector<HTMLInputElement>(
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

export function switchToUnifiedDiff() {
  const checkbox = document.querySelector<HTMLInputElement>(
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

export function toggleWhitespace() {
  const [checkbox, submit] = document.querySelectorAll<HTMLInputElement>(
    '#whitespace-cb, #whitespace-cb ~ button',
  );
  checkbox.checked = true;
  submit.click();
}

export function updateToolbarSummary() {
  const facts = Array.from(document.querySelectorAll('.js-file .file-header'))
    .map((header: HTMLElement) => {
      const file = header.closest<HTMLElement>('.js-file');
      const type = /\b[/.]test/.test(header.dataset.path)
        ? 'test'
        : header.dataset.fileType
            .replace(/^[.]/, '')
            .replace(/([jt])sx$/, '$1s');

      return {
        type,
        viewed: file.dataset.fileUserViewed !== undefined,
        deleted: file.dataset.fileDeleted === 'true',
        open: file.classList.contains('open'),
      };
    })
    .sort((headerA, headerB) => {
      if (headerA.type < headerB.type) {
        return -1;
      } else if (headerA.type > headerB.type) {
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
    }, {} as Summary);

  let factsHtml = document.querySelector('#facts');
  if (!factsHtml) {
    factsHtml = document.createElement('div');
    factsHtml.id = 'facts';
    const defaultProgressBar = document.querySelector<HTMLElement>(
      '.pr-review-tools .diffbar-item progress-bar',
    );
    if (defaultProgressBar) {
      defaultProgressBar.style.display = 'none';
      defaultProgressBar.parentElement.appendChild(factsHtml);
    }
  }
  factsHtml.innerHTML = Object.entries(facts)
    .map(([key, {viewed, total}]) => {
      return viewed === total ? `${key}: ✅` : `${key}: ${viewed} / ${total}`;
    })
    .join(', ');
}
