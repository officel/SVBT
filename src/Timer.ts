import { EventEmitter } from "events";

export class Timer extends EventEmitter {
  private timerId: NodeJS.Timeout | null = null;
  private remainingSeconds: number;

  constructor(private durationInSeconds: number) {
    super();
    this.remainingSeconds = this.durationInSeconds;
  }

  start() {
    if (this.timerId) {
      return; // Timer already running
    }

    this.timerId = setInterval(() => {
      this.remainingSeconds--;
      if (this.remainingSeconds >= 0) {
        this.emit("tick", this.remainingSeconds);
      } else {
        this.stop();
        this.emit("done");
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
