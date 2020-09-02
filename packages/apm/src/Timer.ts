export class Timer {
  #startAt = Date.now();
  #isEnd = false;
  #duration: number = 0;

  static createAndStart(): Timer {
    return new Timer();
  }

  end(): number {
    if (!this.#isEnd) {
      this.#isEnd = true;
      this.#duration = (Date.now() - this.#startAt) * 1e-3;
    }

    return this.#duration;
  }
}
