import * as vscode from "vscode";
import { Timer, TimerMode } from "./Timer";

const START_TIMER_COMMAND = "simple-visual-bar-timer.startTimer";
const STOP_TIMER_COMMAND = "simple-visual-bar-timer.stopTimer";
const START_TIMER_TEXT = "⧁ Start Timer";
const MAX_TIMER_DURATION_MINUTES = 200;

let timer: Timer | null = null;

export function activate(context: vscode.ExtensionContext) {
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    -9999
  );
  statusBarItem.name = "Simple Visual Bar Timer";
  statusBarItem.text = "⧁ SVBT";
  statusBarItem.tooltip = "Simple Visual Bar Timer";
  statusBarItem.command = START_TIMER_COMMAND;
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  let disposable = vscode.commands.registerCommand(
    START_TIMER_COMMAND,
    async () => {
      if (timer) {
        return;
      }

      const config = vscode.workspace.getConfiguration("simpleVisualBarTimer");
      const defaultDuration = config.get<number>("defaultDuration", 25);
      const remainingChar = config.get<string>("remainingChar", "▮");
      const elapsedChar = config.get<string>("elapsedChar", "▯");
      let barCount = config.get<number>("barCount", 10);
      barCount = Math.max(5, Math.min(30, barCount));
      const timerMode = config.get<TimerMode>("timerMode", "countdown");

      const durationInput = await vscode.window.showInputBox({
        prompt: `Enter timer duration in minutes (1-${MAX_TIMER_DURATION_MINUTES})`,
        value: defaultDuration.toString(),
        validateInput: (value) =>
          validateDurationInput(value, MAX_TIMER_DURATION_MINUTES),
      });

      if (durationInput) {
        const totalSeconds = parseInt(durationInput, 10) * 60;
        timer = new Timer(totalSeconds, timerMode);

        const updateStatusBar = (currentSeconds: number) => {
          const minutes = Math.floor(currentSeconds / 60);
          const seconds = currentSeconds % 60;
          const formattedTime = `${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

          let progress;
          let progressBar;
          if (timerMode === "countdown") {
            progress = Math.floor(
              ((totalSeconds - currentSeconds) / totalSeconds) * barCount
            );
            progressBar =
              remainingChar.repeat(barCount - progress) +
              elapsedChar.repeat(progress);
          } else {
            progress = Math.floor((currentSeconds / totalSeconds) * barCount);
            progressBar =
              remainingChar.repeat(progress) +
              elapsedChar.repeat(barCount - progress);
          }

          statusBarItem.text = `⦿ ${formattedTime} ${progressBar}`;
        };

        statusBarItem.command = STOP_TIMER_COMMAND;
        updateStatusBar(timerMode === "countdown" ? totalSeconds : 0);

        timer.on("tick", (currentSeconds: number) => {
          updateStatusBar(currentSeconds);
        });

        timer.on("done", () => {
          statusBarItem.text = START_TIMER_TEXT;
          statusBarItem.command = START_TIMER_COMMAND;
          timer = null;
        });

        timer.start();
      }
    }
  );

  const stopTimerCommand = vscode.commands.registerCommand(
    STOP_TIMER_COMMAND,
    () => {
      if (timer) {
        timer.stop();
        timer = null;
        statusBarItem.text = START_TIMER_TEXT;
        statusBarItem.command = START_TIMER_COMMAND;
      }
    }
  );

  context.subscriptions.push(disposable, stopTimerCommand);
}

export function deactivate() {
  if (timer) {
    timer.stop();
    timer = null;
  }
}

export function validateDurationInput(
  value: string,
  maxDuration: number
): string | null {
  const number = parseInt(value, 10);
  if (isNaN(number) || number < 1 || number > maxDuration) {
    return `Please enter a number between 1 and ${maxDuration}.`;
  }
  return null;
}
