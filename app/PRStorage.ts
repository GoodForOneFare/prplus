import {ReviewLineId} from 'app/types';

export interface PRFileData {
  lines: string[];
}

interface PR {
  reviewedLineIds: ReviewLineId[];
}

export class PrStorage {
  private __data: PR | undefined;
  private readonly localStorageKey: string;

  constructor(private readonly prId: string) {
    this.localStorageKey = `__prs_${this.prId}`;
  }

  private get data() {
    if (this.__data) {
      return this.__data;
    }

    const savedData = window.localStorage[this.localStorageKey];
    this.__data = savedData ? JSON.parse(savedData) : {reviwedLines: []};
    return this.__data!;
  }

  get reviewedLines() {
    return this.data.reviewedLineIds || [];
  }

  saveReviewedLines(reviewedLineIds: string[]) {
    this.data.reviewedLineIds = Array.from(
      new Set([...this.reviewedLines, ...reviewedLineIds]),
    );
    this.save();
  }

  save() {
    window.localStorage[this.localStorageKey] = JSON.stringify(this.data);
  }
}
