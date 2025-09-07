import { Timer } from "./Timer";

jest.useFakeTimers();

describe("Timer Countdown", () => {
  it("should correctly initialize with the given duration", () => {
    const timer = new Timer(60, "countdown");
    // This is an internal detail, but for the sake of a simple test:
    expect((timer as any).remainingSeconds).toBe(60);
  });

  it("should emit a 'tick' event every second with remaining time", () => {
    const timer = new Timer(60, "countdown");
    const tickHandler = jest.fn();

    timer.on("tick", tickHandler);
    timer.start();

    jest.advanceTimersByTime(1000);
    expect(tickHandler).toHaveBeenCalledWith(59);

    jest.advanceTimersByTime(1000);
    expect(tickHandler).toHaveBeenCalledWith(58);

    expect(tickHandler).toHaveBeenCalledTimes(2);
  });

  it("should emit a 'done' event when the timer finishes", () => {
    const timer = new Timer(3, "countdown");
    const doneHandler = jest.fn();

    timer.on("done", doneHandler);
    timer.start();

    jest.advanceTimersByTime(3000);

    expect(doneHandler).toHaveBeenCalledTimes(1);
    // The interval should be cleared
    expect((timer as any).timerId).toBeNull();
  });

  it("should stop the timer when stop() is called", () => {
    const timer = new Timer(60, "countdown");
    const tickHandler = jest.fn();

    timer.on("tick", tickHandler);
    timer.start();

    jest.advanceTimersByTime(5000);
    expect(tickHandler).toHaveBeenCalledTimes(5);

    timer.stop();

    // The interval should be cleared
    expect((timer as any).timerId).toBeNull();

    jest.advanceTimersByTime(5000);
    // No more ticks should have been emitted
    expect(tickHandler).toHaveBeenCalledTimes(5);
  });

  it("should not start a new timer if one is already running", () => {
    const timer = new Timer(60, "countdown");
    timer.start();
    const firstTimerId = (timer as any).timerId;

    timer.start(); // Try to start again
    const secondTimerId = (timer as any).timerId;

    expect(firstTimerId).toBe(secondTimerId);
  });
});

describe("Timer Countup", () => {
  it("should emit a 'tick' event every second with elapsed time", () => {
    const timer = new Timer(60, "countup");
    const tickHandler = jest.fn();

    timer.on("tick", tickHandler);
    timer.start();

    jest.advanceTimersByTime(1000);
    expect(tickHandler).toHaveBeenCalledWith(1);

    jest.advanceTimersByTime(1000);
    expect(tickHandler).toHaveBeenCalledWith(2);

    expect(tickHandler).toHaveBeenCalledTimes(2);
  });

  it("should emit a 'done' event when the timer finishes", () => {
    const timer = new Timer(3, "countup");
    const doneHandler = jest.fn();

    timer.on("done", doneHandler);
    timer.start();

    jest.advanceTimersByTime(3000);

    expect(doneHandler).toHaveBeenCalledTimes(1);
    // The interval should be cleared
    expect((timer as any).timerId).toBeNull();
  });

  it("should not tick past the duration", () => {
    const timer = new Timer(3, "countup");
    const tickHandler = jest.fn();

    timer.on("tick", tickHandler);
    timer.start();

    jest.advanceTimersByTime(5000);

    expect(tickHandler).toHaveBeenCalledTimes(3);
    expect(tickHandler).toHaveBeenLastCalledWith(3);
  });
});
