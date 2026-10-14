import { describe, it, expect } from "vitest";
import { AppointmentStatus } from "@prisma/client";
import {
  detectSlotConflict,
  parseInboundSmsReply,
  isEscalationRequested,
  buildTransferTwiml,
  DEFAULT_AVAILABLE_SLOTS,
} from "../lib/telephony/scheduling-logic";

describe("Conflict-Free Scheduling Logic", () => {
  const testDate = "2026-10-15";

  it("should have valid standard clinical appointment slot defaults", () => {
    expect(DEFAULT_AVAILABLE_SLOTS).toContain("10:30 AM");
    expect(DEFAULT_AVAILABLE_SLOTS.length).toBeGreaterThanOrEqual(10);
  });

  it("should assign preferred slot when no collision exists", () => {
    const existing = [
      { date: testDate, time: "9:00 AM", status: AppointmentStatus.CONFIRMED },
      { date: testDate, time: "11:00 AM", status: AppointmentStatus.CONFIRMED },
    ];

    const result = detectSlotConflict(existing, testDate, "10:30 AM");
    expect(result.hasConflict).toBe(false);
    expect(result.assignedDate).toBe(testDate);
    expect(result.assignedTime).toBe("10:30 AM");
    expect(result.isAlternative).toBe(false);
  });

  it("should detect collision when 10:30 AM is taken and pick next open slot (11:00 AM)", () => {
    const existing = [
      { date: testDate, time: "10:30 AM", status: AppointmentStatus.CONFIRMED },
    ];

    const result = detectSlotConflict(existing, testDate, "10:30 AM");
    expect(result.hasConflict).toBe(true);
    expect(result.isAlternative).toBe(true);
    expect(result.assignedTime).toBe("11:00 AM");
  });

  it("should skip consecutively booked slots until an open one is found", () => {
    const existing = [
      { date: testDate, time: "10:30 AM", status: AppointmentStatus.CONFIRMED },
      { date: testDate, time: "11:00 AM", status: AppointmentStatus.CONFIRMED },
      { date: testDate, time: "11:30 AM", status: AppointmentStatus.CONFIRMED },
    ];

    const result = detectSlotConflict(existing, testDate, "10:30 AM");
    expect(result.hasConflict).toBe(true);
    expect(result.assignedTime).toBe("1:30 PM");
  });

  it("should ignore CANCELLED appointments when evaluating slot conflicts", () => {
    const existing = [
      { date: testDate, time: "10:30 AM", status: AppointmentStatus.CANCELLED },
    ];

    const result = detectSlotConflict(existing, testDate, "10:30 AM");
    expect(result.hasConflict).toBe(false);
    expect(result.assignedTime).toBe("10:30 AM");
    expect(result.isAlternative).toBe(false);
  });
});

describe("Inbound 2-Way SMS Reply Parser", () => {
  it("should parse confirmation replies ('C', 'CONFIRM', 'YES', 'Y')", () => {
    const inputs = ["C", "c", "confirm", "CONFIRM", "Yes", "YES", "Y"];

    for (const input of inputs) {
      const result = parseInboundSmsReply(input);
      expect(result.action).toBe("CONFIRM");
      expect(result.targetStatus).toBe(AppointmentStatus.CONFIRMED);
      expect(result.message).toContain("confirmed");
    }
  });

  it("should parse reschedule requests ('R', 'RESCHEDULE', 'CHANGE')", () => {
    const inputs = ["R", "r", "reschedule", "RESCHEDULE", "need to change time"];

    for (const input of inputs) {
      const result = parseInboundSmsReply(input);
      expect(result.action).toBe("RESCHEDULE");
      expect(result.targetStatus).toBe(AppointmentStatus.PENDING);
      expect(result.message).toContain("reschedule your visit");
    }
  });

  it("should parse cancellation requests ('CANCEL', 'cancel')", () => {
    const inputs = ["CANCEL", "cancel", "Cancel please"];

    for (const input of inputs) {
      const result = parseInboundSmsReply(input);
      expect(result.action).toBe("CANCEL");
      expect(result.targetStatus).toBe(AppointmentStatus.CANCELLED);
      expect(result.message).toContain("cancelled");
    }
  });

  it("should return UNKNOWN action for unmapped inquiries with prompt guidance", () => {
    const result = parseInboundSmsReply("What is your office address?");
    expect(result.action).toBe("UNKNOWN");
    expect(result.targetStatus).toBeNull();
    expect(result.message).toContain("Reply C to confirm");
  });
});

describe("Telephony Escalation & TwiML Dial Transfer", () => {
  it("should identify human escalation keywords in speech", () => {
    expect(isEscalationRequested("Can I speak with a human please?")).toBe(true);
    expect(isEscalationRequested("Operator, get me the front desk")).toBe(true);
    expect(isEscalationRequested("I have severe pain in my wisdom tooth")).toBe(true);
    expect(isEscalationRequested("This is an emergency")).toBe(true);
    expect(isEscalationRequested("I need a real doctor right now")).toBe(true);
  });

  it("should not trigger escalation on normal scheduling inquiries", () => {
    expect(isEscalationRequested("Hi, I want to book a routine dental cleaning")).toBe(false);
    expect(isEscalationRequested("Do you take Delta Dental insurance?")).toBe(false);
    expect(isEscalationRequested("What are your hours on Saturday?")).toBe(false);
  });

  it("should construct valid TwiML with <Say> announcement and <Dial> destination", () => {
    const twiml = buildTransferTwiml("+14158004291");
    expect(twiml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(twiml).toContain("<Response>");
    expect(twiml).toContain("<Say");
    expect(twiml).toContain("transfer you to our front desk");
    expect(twiml).toContain("<Dial>+14158004291</Dial>");
    expect(twiml).toContain("</Response>");
  });
});
