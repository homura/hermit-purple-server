export class Timer {
  #startAt = Date.now();
  #isEnd = false;

  static createAndStart(): Timer {
    return new Timer();
  }

  end(): number {
    this.#isEnd = true;
    return (Date.now() - this.#startAt) * 1e-3;
  }
}
