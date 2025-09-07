import { EventEmitter } from "events";

export type TimerMode = "countdown" | "countup";

export class Timer extends EventEmitter {
  private timerId: NodeJS.Timeout | null = null;
  private remainingSeconds: number;
  private elapsedSeconds: number = 0;

  constructor(
    private durationInSeconds: number,
    private mode: TimerMode = "countdown"
  ) {
    super();
    this.remainingSeconds = this.durationInSeconds;
  }

  start() {
    if (this.timerId) {
      return; // Timer already running
    }

    this.timerId = setInterval(() => {
      if (this.mode === "countdown") {
        this.remainingSeconds--;
        this.emit("tick", this.remainingSeconds);
        if (this.remainingSeconds <= 0) {
          this.stop();
          this.emit("done");
        }
      } else {
        this.elapsedSeconds++;
        this.emit("tick", this.elapsedSeconds);
        if (this.elapsedSeconds >= this.durationInSeconds) {
          this.stop();
          this.emit("done");
        }
      }
    }, 1000);
  }

  stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
}
