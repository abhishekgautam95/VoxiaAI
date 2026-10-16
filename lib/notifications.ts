import { db } from "@/lib/db";
import { IntegrationProvider } from "@prisma/client";

export interface AppointmentNotificationData {
  id: string;
  customerName: string;
  phoneNumber: string;
  service: string;
  date: string;
  time: string;
  provider?: string | null;
  organizationName?: string;
}

export interface SmsDeliveryResult {
  sent: boolean;
  simulated: boolean;
  deliveryStatus: "DELIVERED" | "UNCONFIGURED" | "FAILED";
  message: string;
}

export async function dispatchAppointmentWebhook(
  organizationId: string,
  appointment: AppointmentNotificationData
): Promise<boolean> {
  try {
    const integration = await db.integrationConfig.findUnique({
      where: {
        organizationId_provider: {
          organizationId,
          provider: IntegrationProvider.TWILIO,
        },
      },
    });

    const config = (integration?.config || {}) as Record<string, unknown>;
    const webhookUrl = (config.webhookUrl as string) || process.env.VOXIA_WEBHOOK_URL;

    if (!webhookUrl || !webhookUrl.startsWith("http")) {
      return false;
    }

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Voxia-Event": "appointment.created",
      },
      body: JSON.stringify({
        event: "appointment.created",
        timestamp: new Date().toISOString(),
        organizationId,
        data: appointment,
      }),
    });

    return res.ok;
  } catch {
    return false;
  }
}

export async function sendSmsConfirmation(
  organizationId: string,
  appointment: AppointmentNotificationData
): Promise<SmsDeliveryResult> {
  try {
    const org = await db.organization.findUnique({
      where: { id: organizationId },
      select: { name: true },
    });

    const clinicName = org?.name || "Apex Health & Dental";
    const body = `${clinicName}: Your ${appointment.service} is confirmed for ${appointment.date} at ${appointment.time}. Please arrive 10 min early. Reply CANCEL to change.`;

    const integration = await db.integrationConfig.findUnique({
      where: {
        organizationId_provider: {
          organizationId,
          provider: IntegrationProvider.TWILIO,
        },
      },
    });

    const config = (integration?.config || {}) as Record<string, unknown>;
    const accountSid = (config.accountSid as string) || process.env.TWILIO_ACCOUNT_SID;
    const authToken = (config.authToken as string) || process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = (config.fromNumber as string) || process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      return {
        sent: false,
        simulated: true,
        deliveryStatus: "UNCONFIGURED",
        message: body,
      };
    }

    const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
    const form = new URLSearchParams();
    form.append("From", fromNumber);
    form.append("To", appointment.phoneNumber);
    form.append("Body", body);

    const twilioRes = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: form.toString(),
      }
    );

    if (twilioRes.ok) {
      return {
        sent: true,
        simulated: false,
        deliveryStatus: "DELIVERED",
        message: body,
      };
    }

    return {
      sent: false,
      simulated: false,
      deliveryStatus: "FAILED",
      message: `Twilio SMS dispatch failed with HTTP ${twilioRes.status}`,
    };
  } catch {
    return {
      sent: false,
      simulated: false,
      deliveryStatus: "FAILED",
      message: "Failed to dispatch SMS",
    };
  }
}
