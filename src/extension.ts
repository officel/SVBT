import * as vscode from "vscode";
import { Timer } from "./Timer";

let timer: Timer | null = null;

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "status-bar-timer" is now active!');

  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBarItem.command = "status-bar-timer.startTimer";
  statusBarItem.text = "▶ Start Timer";
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  let disposable = vscode.commands.registerCommand("status-bar-timer.startTimer", async () => {
    if (timer) {
      return;
    }

    const config = vscode.workspace.getConfiguration("statusBarTimer");
    const defaultDuration = config.get<number>("defaultDuration", 30);

    const durationInput = await vscode.window.showInputBox({
      prompt: "Enter timer duration in minutes (1-60)",
      value: defaultDuration.toString(),
      validateInput: (value) => {
        const number = parseInt(value, 10);
        if (isNaN(number) || number < 1 || number > 60) {
          return "Please enter a number between 1 and 60.";
        }
        return null;
      },
    });

    if (durationInput) {
      const totalSeconds = parseInt(durationInput, 10) * 60;
      timer = new Timer(totalSeconds);

      const updateStatusBar = (remainingSeconds: number) => {
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

        const progress = Math.floor(((totalSeconds - remainingSeconds) / totalSeconds) * 10);
        // 絵文字はズレが大きいのでなしの方向で
        // const progressBar = "🔳".repeat(progress) + "🔲".repeat(10 - progress);

        // 進捗式（経過時間が塗られる）もいいけど
        // const progressBar = "⭓".repeat(progress) + "⭔".repeat(10 - progress);

        // カウントダウン式（残り時間が減るように見える）
        // const progressBar = "⭓".repeat(10 - progress) + "⭔".repeat(progress); // OK
        const progressBar = "▮".repeat(10 - progress) + "▯".repeat(progress);

        statusBarItem.text = `⦿ ${formattedTime} ${progressBar}`;
      };

      statusBarItem.command = "status-bar-timer.stopTimer";
      updateStatusBar(totalSeconds);

      timer.on("tick", (remainingSeconds: number) => {
        updateStatusBar(remainingSeconds);
      });

      timer.on("done", () => {
        statusBarItem.text = "⧁ Start Timer";
        statusBarItem.command = "status-bar-timer.startTimer";
        timer = null;
      });

      timer.start();
    }
  });

  const stopTimerCommand = vscode.commands.registerCommand("status-bar-timer.stopTimer", () => {
    if (timer) {
      timer.stop();
      timer = null;
      statusBarItem.text = "⧁ Start Timer";
      statusBarItem.command = "status-bar-timer.startTimer";
    }
  });

  context.subscriptions.push(disposable, stopTimerCommand);
}

export function deactivate() {
  if (timer) {
    timer.stop();
    timer = null;
  }
}
