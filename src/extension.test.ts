// We need to dynamically import so we can reset modules.
let extension: {
  activate: (context: any) => void;
  deactivate: () => void;
  validateDurationInput: (value: string, max: number) => string | null;
};

jest.useFakeTimers();

describe("validateDurationInput", () => {
  beforeAll(() => {
    // This suite only tests a pure function, but the module it's in
    // imports vscode. So we need to provide a minimal mock.
    jest.mock("vscode", () => ({}), { virtual: true });
    extension = require("./extension");
  });

  const MAX_DURATION = 200;

  test("should return null for valid input", () => {
    expect(extension.validateDurationInput("100", MAX_DURATION)).toBeNull();
  });

  test("should return null for lower boundary", () => {
    expect(extension.validateDurationInput("1", MAX_DURATION)).toBeNull();
  });

  test("should return null for upper boundary", () => {
    expect(extension.validateDurationInput("200", MAX_DURATION)).toBeNull();
  });

  test("should return error message for non-numeric input", () => {
    expect(extension.validateDurationInput("abc", MAX_DURATION)).toBe(
      "Please enter a number between 1 and 200."
    );
  });

  test.each(["1abc", "1.5", "1e2"])(
    "should reject non-integer input %s",
    (value) => {
      expect(extension.validateDurationInput(value, MAX_DURATION)).toBe(
        "Please enter a number between 1 and 200."
      );
    }
  );

  test("should return error message for value less than 1", () => {
    expect(extension.validateDurationInput("0", MAX_DURATION)).toBe(
      "Please enter a number between 1 and 200."
    );
  });

  test("should return error message for value greater than max duration", () => {
    expect(extension.validateDurationInput("201", MAX_DURATION)).toBe(
      "Please enter a number between 1 and 200."
    );
  });
});

describe("extension activation", () => {
  let mockStatusBarItem: any;
  let commandHandlers: { [key: string]: (...args: any[]) => any };
  let mockContext: any;
  let mockVscode: any;
  let mockConfiguration: { [key: string]: any };

  beforeEach(() => {
    jest.resetModules();

    mockVscode = {
      window: {
        createStatusBarItem: jest.fn(),
        showInputBox: jest.fn(),
      },
      commands: {
        registerCommand: jest.fn(),
      },
      workspace: {
        getConfiguration: jest.fn(),
      },
      StatusBarAlignment: {
        Left: 1,
      },
    };
    jest.mock("vscode", () => mockVscode, { virtual: true });

    commandHandlers = {};
    mockStatusBarItem = {
      text: "",
      command: undefined,
      show: jest.fn(),
      name: undefined,
      tooltip: undefined,
    };
    mockContext = {
      subscriptions: {
        push: jest.fn(),
      },
    };
    mockConfiguration = {
      defaultDuration: 25,
      remainingChar: "▮",
      elapsedChar: "▯",
      barCount: 10,
      timerMode: "countdown",
    };

    mockVscode.window.createStatusBarItem.mockReturnValue(mockStatusBarItem);
    mockVscode.commands.registerCommand.mockImplementation(
      (command: string, handler: any) => {
        commandHandlers[command] = handler;
        return { dispose: jest.fn() };
      }
    );
    mockVscode.workspace.getConfiguration.mockReturnValue({
      get: jest.fn(
        (key: string, defaultValue: any) =>
          mockConfiguration[key] ?? defaultValue
      ),
    });

    extension = require("./extension");
  });

  afterEach(() => {
    extension.deactivate();
  });

  test("should register commands and create status bar item on activation", () => {
    extension.activate(mockContext);

    expect(mockVscode.window.createStatusBarItem).toHaveBeenCalledWith(
      mockVscode.StatusBarAlignment.Left,
      -9999
    );
    expect(mockStatusBarItem.show).toHaveBeenCalled();
    expect(mockContext.subscriptions.push).toHaveBeenCalledTimes(2);
  });

  test("startTimer command should set task name correctly when provided", async () => {
    extension.activate(mockContext);
    const startTimerHandler =
      commandHandlers["simple-visual-bar-timer.startTimer"];

    mockVscode.window.showInputBox
      .mockResolvedValueOnce("1")
      .mockResolvedValueOnce("My Test Task");

    await startTimerHandler();

    jest.advanceTimersByTime(1000);

    expect(mockStatusBarItem.text).toContain("My Test Task");
    expect(mockStatusBarItem.text).toMatch(/⦿ \d{2}:\d{2} .* My Test Task/);
  });

  test("startTimer command should use default task name when none is provided", async () => {
    extension.activate(mockContext);
    const startTimerHandler =
      commandHandlers["simple-visual-bar-timer.startTimer"];

    mockVscode.window.showInputBox
      .mockResolvedValueOnce("1")
      .mockResolvedValueOnce(undefined);

    await startTimerHandler();

    jest.advanceTimersByTime(1000);

    expect(mockStatusBarItem.text).toContain("集中して作業中");
    expect(mockStatusBarItem.text).toMatch(/⦿ \d{2}:\d{2} .* 集中して作業中/);
  });

  test("startTimer command should leave the status bar unchanged when duration is canceled", async () => {
    extension.activate(mockContext);
    const startTimerHandler =
      commandHandlers["simple-visual-bar-timer.startTimer"];
    mockVscode.window.showInputBox.mockResolvedValueOnce(undefined);

    await startTimerHandler();

    expect(mockVscode.window.showInputBox).toHaveBeenCalledTimes(1);
    expect(mockStatusBarItem.text).toBe("⧁ SVBT");
    expect(mockStatusBarItem.command).toBe(
      "simple-visual-bar-timer.startTimer"
    );
  });

  test("startTimer command should ignore a second start while a timer is running", async () => {
    extension.activate(mockContext);
    const startTimerHandler =
      commandHandlers["simple-visual-bar-timer.startTimer"];
    mockVscode.window.showInputBox
      .mockResolvedValueOnce("1")
      .mockResolvedValueOnce("My Task");

    await startTimerHandler();
    const activeText = mockStatusBarItem.text;

    await startTimerHandler();

    expect(mockVscode.window.showInputBox).toHaveBeenCalledTimes(2);
    expect(mockStatusBarItem.text).toBe(activeText);
  });

  test("stopTimer command should stop the timer and restore the start status", async () => {
    extension.activate(mockContext);
    const startTimerHandler =
      commandHandlers["simple-visual-bar-timer.startTimer"];
    mockVscode.window.showInputBox
      .mockResolvedValueOnce("1")
      .mockResolvedValueOnce("My Task");

    await startTimerHandler();
    const stopTimerHandler =
      commandHandlers["simple-visual-bar-timer.stopTimer"];
    stopTimerHandler();
    const stoppedText = mockStatusBarItem.text;

    jest.advanceTimersByTime(5000);

    expect(stoppedText).toBe("⧁ Start Timer");
    expect(mockStatusBarItem.command).toBe(
      "simple-visual-bar-timer.startTimer"
    );
    expect(mockStatusBarItem.text).toBe(stoppedText);
  });

  test("deactivate should stop the active timer", async () => {
    extension.activate(mockContext);
    const startTimerHandler =
      commandHandlers["simple-visual-bar-timer.startTimer"];
    mockVscode.window.showInputBox
      .mockResolvedValueOnce("1")
      .mockResolvedValueOnce("My Task");

    await startTimerHandler();
    jest.advanceTimersByTime(1000);
    const activeText = mockStatusBarItem.text;

    extension.deactivate();
    jest.advanceTimersByTime(5000);

    expect(mockStatusBarItem.text).toBe(activeText);
  });

  test("countup mode should render elapsed time and configured progress characters", async () => {
    mockConfiguration.timerMode = "countup";
    mockConfiguration.remainingChar = "R";
    mockConfiguration.elapsedChar = "E";
    mockConfiguration.barCount = 6;
    extension.activate(mockContext);
    const startTimerHandler =
      commandHandlers["simple-visual-bar-timer.startTimer"];
    mockVscode.window.showInputBox
      .mockResolvedValueOnce("1")
      .mockResolvedValueOnce("My Task");

    await startTimerHandler();
    expect(mockStatusBarItem.text).toBe("⦿ 00:00 EEEEEE My Task");

    jest.advanceTimersByTime(30000);

    expect(mockStatusBarItem.text).toBe("⦿ 00:30 RRREEE My Task");

    jest.advanceTimersByTime(30000);

    expect(mockStatusBarItem.text).toBe("⧁ Start Timer");
    expect(mockStatusBarItem.command).toBe(
      "simple-visual-bar-timer.startTimer"
    );
  });

  test.each([
    [2, 5],
    [99, 30],
  ])(
    "barCount %i should be clamped to %i",
    async (configuredCount, expectedCount) => {
      mockConfiguration.barCount = configuredCount;
      extension.activate(mockContext);
      const startTimerHandler =
        commandHandlers["simple-visual-bar-timer.startTimer"];
      mockVscode.window.showInputBox
        .mockResolvedValueOnce("1")
        .mockResolvedValueOnce("My Task");

      await startTimerHandler();

      expect(mockStatusBarItem.text).toBe(
        `⦿ 01:00 ${"▮".repeat(expectedCount)} My Task`
      );
    }
  );
});
