import {PrStorage} from './PRStorage';
import {Styles} from './Styles';
import {DiffType} from './types';

export class ReviewLines {
  constructor(
    private readonly diffType: DiffType,
    private readonly storage: PrStorage,
  ) {}

  handleReviewedIds(tdIds: string[]) {
    if (tdIds.length === 0) {
      return;
    }

    const domSelector = `#${tdIds.join(', #')}`;
    document
      .querySelectorAll<HTMLElement>(domSelector)
      .forEach((lineElement) => {
        // Highlight the line number cell.
        lineElement.classList.add(Styles.Review.reviewedCell);

        if (this.diffType === 'split') {
          // Highlight the code cell.
          lineElement.nextElementSibling?.classList.add(
            Styles.Review.reviewedCell,
          );
        } else if (this.diffType === 'unified') {
          highlightUnifiedDiffLine(lineElement);
        }
      });
  }

  handleReviewedSelection = (selectedElements: HTMLElement[]) => {
    const [firstTd] = selectedElements;
    const match = firstTd.id.match(/([L|R])\d+/);
    if (!match || !match[1]) {
      return;
    }

    const [, diffSide] = match;
    const selectedIds = selectedElements
      .map(({id}) => id)
      .filter((id) => id.includes(diffSide));
    this.storage.saveReviewedLines(selectedIds);
  };
}

function highlightUnifiedDiffLine(lineNumberCell: HTMLElement) {
  const isAddedLine = /R/.test(lineNumberCell.id);
  const cells: (Element | null | undefined)[] = [lineNumberCell];
  if (isAddedLine) {
    // The code cell.
    cells.push(lineNumberCell.nextElementSibling);
    // The blank cell to the left of the line number.
    cells.push(lineNumberCell.previousElementSibling);
  } else {
    // The blank cell to the right of the removed line number.
    const placeholderCell = lineNumberCell.nextElementSibling;
    cells.push(placeholderCell);
    // The code cell.
    cells.push(placeholderCell?.nextElementSibling);
  }

  cells.forEach((cell) => {
    cell?.classList.add(Styles.Review.reviewedCell);
  });
}
