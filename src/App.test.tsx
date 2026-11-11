
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import App from "./App";
import { rooms } from "./data";

describe("Smart Campus integration", () => {
  it("uses bookings of the newly selected room", () => {
    render(<App />);

    // Set a predictable current time and booking interval.
    fireEvent.change(screen.getByLabelText("Current time"), {
      target: { value: "08:00" },
    });
    fireEvent.change(screen.getByLabelText("Start"), {
      target: { value: "09:00" },
    });
    fireEvent.change(screen.getByLabelText("End"), {
      target: { value: "10:00" },
    });

    // Newton 101 has an existing booking from 09:00 to 10:00.
    fireEvent.click(screen.getByRole("button", { name: /Newton 101/ }));
    fireEvent.click(
      screen.getByRole("button", { name: /Check Availability/ })
    );

    expect(screen.getByText("Unavailable")).toBeTruthy();

    // Curie Conference Room has no booking during this interval.
    fireEvent.click(
      screen.getByRole("button", { name: /Curie Conference Room/ })
    );
    fireEvent.click(
      screen.getByRole("button", { name: /Check Availability/ })
    );

    expect(screen.getByText("Available")).toBeTruthy();
    expect(
      screen.getAllByText(rooms[2].bookings[0].label).length
    ).toBeGreaterThan(0);
    expect(
      screen.queryByText(rooms[0].bookings[0].label)
    ).toBeNull();
  });

  it("disables selection of blocked rooms", () => {
    render(<App />);

    const blockedButton = screen.getByRole("button", { name: /Tesla Lab 2B/ });
    expect(blockedButton.hasAttribute("disabled")).toBe(true);
  });
});
