import { AppointmentStatus } from "@prisma/client";

export const DEFAULT_AVAILABLE_SLOTS = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
];

export const DEFAULT_TRANSFER_KEYWORDS = [
  "human",
  "operator",
  "person",
  "emergency",
  "severe pain",
  "doctor",
  "receptionist",
  "speak to someone",
];

export interface SlotAppointment {
  date: string;
  time: string;
  status: string | AppointmentStatus;
}

export interface ConflictCheckResult {
  hasConflict: boolean;
  assignedTime: string;
  assignedDate: string;
  isAlternative: boolean;
}

/**
 * Checks for booking conflicts against existing practice appointments on a given date/time,
 * and automatically assigns the next open slot if the requested slot is taken.
 */
export function detectSlotConflict(
  existingAppointments: SlotAppointment[],
  preferredDate: string,
  preferredTime: string,
  slots: string[] = DEFAULT_AVAILABLE_SLOTS
): ConflictCheckResult {
  // Active booked appointments (ignoring cancelled ones)
  const activeBookings = existingAppointments.filter(
    (apt) => apt.date === preferredDate && apt.status !== "CANCELLED"
  );

  const isPreferredTaken = activeBookings.some((apt) => apt.time === preferredTime);

  if (!isPreferredTaken) {
    return {
      hasConflict: false,
      assignedDate: preferredDate,
      assignedTime: preferredTime,
      isAlternative: false,
    };
  }

  // Find the next available opening
  const preferredIndex = slots.indexOf(preferredTime);
  const reorderedSlots =
    preferredIndex >= 0
      ? [...slots.slice(preferredIndex + 1), ...slots.slice(0, preferredIndex)]
      : slots;

  for (const slot of reorderedSlots) {
    const isSlotTaken = activeBookings.some((apt) => apt.time === slot);
    if (!isSlotTaken) {
      return {
        hasConflict: true,
        assignedDate: preferredDate,
        assignedTime: slot,
        isAlternative: true,
      };
    }
  }

  // If all slots on this date are taken, default to first slot of next day
  return {
    hasConflict: true,
    assignedDate: preferredDate,
    assignedTime: slots[0] || "9:00 AM",
    isAlternative: true,
  };
}

export type SmsAction = "CONFIRM" | "RESCHEDULE" | "CANCEL" | "UNKNOWN";

export interface ParsedSmsReply {
  action: SmsAction;
  targetStatus: AppointmentStatus | null;
  message: string;
}

/**
 * Parses caller 2-way inbound SMS replies (e.g. "Reply C to confirm, R to reschedule, CANCEL to cancel")
 */
export function parseInboundSmsReply(bodyText: string, practiceName = "Apex Health & Dental"): ParsedSmsReply {
  const upper = (bodyText || "").trim().toUpperCase();

  if (
    upper === "C" ||
    upper.startsWith("CONFIRM") ||
    upper === "YES" ||
    upper === "Y"
  ) {
    return {
      action: "CONFIRM",
      targetStatus: AppointmentStatus.CONFIRMED,
      message: `${practiceName}: Thank you! Your appointment is confirmed. Reply CANCEL if you need to cancel.`,
    };
  }

  if (
    upper === "R" ||
    upper.startsWith("RESCHEDULE") ||
    upper.includes("CHANGE")
  ) {
    return {
      action: "RESCHEDULE",
      targetStatus: AppointmentStatus.PENDING,
      message: `${practiceName}: We have noted your request to reschedule your visit. Our front desk staff will contact you shortly with alternative openings.`,
    };
  }

  if (upper === "CANCEL" || upper.startsWith("CANCEL")) {
    return {
      action: "CANCEL",
      targetStatus: AppointmentStatus.CANCELLED,
      message: `${practiceName}: Your appointment has been cancelled. Please call us or visit our portal when you are ready to rebook.`,
    };
  }

  return {
    action: "UNKNOWN",
    targetStatus: null,
    message: `${practiceName}: Thank you for your message. Reply C to confirm your appointment, R to reschedule, or CANCEL to cancel.`,
  };
}

/**
 * Checks if caller's transcribed speech contains escalation keywords requiring transfer to front desk staff.
 */
export function isEscalationRequested(
  speechResult: string,
  transferKeywords: string[] | string = DEFAULT_TRANSFER_KEYWORDS
): boolean {
  if (!speechResult) return false;
  const lower = speechResult.toLowerCase();

  const keywords = Array.isArray(transferKeywords)
    ? transferKeywords
    : transferKeywords
        .split(",")
        .map((k) => k.trim().toLowerCase())
        .filter(Boolean);

  return keywords.some((kw) => lower.includes(kw.toLowerCase()));
}

/**
 * Builds valid TwiML XML to dial and transfer caller to human staff.
 */
export function buildTransferTwiml(
  destinationPhone: string,
  announcement = "Please hold while I transfer you to our front desk staff."
): string {
  const cleanPhone = destinationPhone.trim();
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna-Neural">${announcement}</Say>
  <Dial>${cleanPhone}</Dial>
</Response>`.trim();
}
