import { describe, expect, test } from "@jest/globals";

describe("HELLO WORLD", () => {
  test("if it will render hello world", () => {
    expect("Hello world").toBe("Hello world");
  });
});
