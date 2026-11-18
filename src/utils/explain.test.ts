import { describe, expect, it } from "vitest";
import {
  buildExplanationInput,
  generateExplanation,
  validateExplanationInput,
  validateExplanationOutput,
} from "./explain";
import type { Room } from "../types";

const roomB: Room = {
  id: "room-b",
  name: "Room B",
  building: "Main",
  capacity: 10,
  equipment: ["Computers"],
  blocked: false,
  bookings: [],
};

describe("buildExplanationInput", () => {
  it("derives available status from the checker result", () => {
    const input = buildExplanationInput(
      roomB,
      { status: "available" },
      600,
      660
    );

    expect(input.isAvailable).toBe(true);
    expect(input.reasonCode).toBe("available");
    expect(input.roomLabel).toBe("Room B");
  });

  it("classifies a blocked room", () => {
    const blocked = { ...roomB, blocked: true };
    const input = buildExplanationInput(
      blocked,
      { status: "unavailable", reason: "Room is blocked — maintenance." },
      600,
      660
    );

    expect(input.isAvailable).toBe(false);
    expect(input.reasonCode).toBe("room_blocked");
  });

  it("classifies an overlap", () => {
    const input = buildExplanationInput(
      roomB,
      { status: "unavailable", reason: "Overlaps existing booking (09:00–10:00)." },
      600,
      660
    );

    expect(input.reasonCode).toBe("booking_overlap");
  });

  it("uses a placeholder label when the room is null", () => {
    const input = buildExplanationInput(
      null,
      { status: "unavailable", reason: "Please select a room." },
      600,
      660
    );

    expect(input.roomLabel).toBe("Unknown room");
    expect(input.reasonCode).toBe("room_not_selected");
  });
});

describe("validateExplanationInput", () => {
  it("accepts a well-formed payload", () => {
    const input = buildExplanationInput(
      roomB,
      { status: "available" },
      600,
      660
    );

    expect(validateExplanationInput(input)).toBeNull();
  });

  it("rejects non-finite times", () => {
    const input = { ...buildExplanationInput(roomB, { status: "available" }, 600, 660) };
    input.startMinutes = NaN;

    expect(validateExplanationInput(input)).toMatch(/valid numbers/);
  });

  it("rejects an inverted interval", () => {
    const input = buildExplanationInput(roomB, { status: "available" }, 660, 600);

    expect(validateExplanationInput(input)).toMatch(/before end/);
  });

  it("rejects an unknown reason code", () => {
    const input = { ...buildExplanationInput(roomB, { status: "available" }, 600, 660) };
    (input as { reasonCode: string }).reasonCode = "mystery";

    expect(validateExplanationInput(input)).toMatch(/Unknown reason/);
  });

  it("rejects a missing room label", () => {
    const input = { ...buildExplanationInput(roomB, { status: "available" }, 600, 660) };
    (input as { roomLabel: string }).roomLabel = "   ";

    expect(validateExplanationInput(input)).toMatch(/label is missing/);
  });

  it("rejects a non-boolean availability flag", () => {
    const input = { ...buildExplanationInput(roomB, { status: "available" }, 600, 660) };
    (input as { isAvailable: boolean }).isAvailable = "yes" as unknown as boolean;

    expect(validateExplanationInput(input)).toMatch(/boolean/);
  });

  it("rejects a non-object payload", () => {
    expect(validateExplanationInput(null)).toMatch(/must be an object/);
    expect(validateExplanationInput(42)).toMatch(/must be an object/);
  });
});

describe("generateExplanation", () => {
  it("returns a two-sentence explanation for an available slot", () => {
    const input = buildExplanationInput(
      roomB,
      { status: "available" },
      600,
      660
    );
    const output = generateExplanation(input);

    expect(output.usedFallback).toBe(false);
    expect(output.text.split(/[.!?]+\s|[.!?]+$/).filter((s) => s.trim()).length)
      .toBe(2);
  });

  it("returns a safe fallback for invalid input", () => {
    const output = generateExplanation({
      roomLabel: "",
      startMinutes: NaN,
      endMinutes: 660,
      isAvailable: true,
      reasonCode: "mystery" as never,
    });

    expect(output.usedFallback).toBe(true);
    expect(output.text).toMatch(/Explanation generation failed/);
  });

  it("fallback never contradicts the confirmed status", () => {
    const input = buildExplanationInput(
      roomB,
      { status: "available" },
      600,
      660
    );
    const output = generateExplanation({
      ...input,
      reasonCode: "mystery" as never,
    });

    expect(output.usedFallback).toBe(true);
    expect(output.text).not.toMatch(/\bblocked\b/i);
    expect(output.text).not.toMatch(/\boverlap\b/i);
  });
});

describe("validateExplanationOutput", () => {
  it("rejects more than two sentences", () => {
    expect(
      validateExplanationOutput(
        "One. Two. Three.",
        true
      )
    ).toMatch(/two sentences/);
  });

  it("rejects empty output", () => {
    expect(validateExplanationOutput("", true)).toMatch(/empty/);
    expect(validateExplanationOutput("   ", true)).toMatch(/empty/);
  });

  it("rejects contradictions of the confirmed status", () => {
    expect(
      validateExplanationOutput(
        "The room is unavailable during this slot. It is blocked.",
        true
      )
    ).toMatch(/contradicts/);
    expect(
      validateExplanationOutput(
        "The room is free during this slot. You can book it.",
        false
      )
    ).toMatch(/contradicts/);
  });

  it("accepts consistent output", () => {
    expect(
      validateExplanationOutput(
        "The room is free during this slot. No conflicts exist.",
        true
      )
    ).toBeNull();
    expect(
      validateExplanationOutput(
        "The room is blocked during this slot. Try another time.",
        false
      )
    ).toBeNull();
  });
});
