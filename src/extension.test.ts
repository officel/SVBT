import { validateDurationInput } from "./extension";

jest.mock("vscode", () => ({}), { virtual: true });

describe("validateDurationInput", () => {
  const MAX_DURATION = 200;

  test("should return null for valid input", () => {
    expect(validateDurationInput("100", MAX_DURATION)).toBeNull();
  });

  test("should return null for lower boundary", () => {
    expect(validateDurationInput("1", MAX_DURATION)).toBeNull();
  });

  test("should return null for upper boundary", () => {
    expect(validateDurationInput("200", MAX_DURATION)).toBeNull();
  });

  test("should return error message for non-numeric input", () => {
    expect(validateDurationInput("abc", MAX_DURATION)).toBe(
      "Please enter a number between 1 and 200."
    );
  });

  test("should return error message for value less than 1", () => {
    expect(validateDurationInput("0", MAX_DURATION)).toBe(
      "Please enter a number between 1 and 200."
    );
  });

  test("should return error message for value greater than max duration", () => {
    expect(validateDurationInput("201", MAX_DURATION)).toBe(
      "Please enter a number between 1 and 200."
    );
  });
});
