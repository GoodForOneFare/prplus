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
