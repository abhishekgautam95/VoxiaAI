export type AppointmentStatus = "Confirmed" | "Cancelled" | "Completed";

export interface Appointment {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  serviceRequested: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "09:30 AM"
  durationMinutes: number;
  status: AppointmentStatus;
  provider: string;
  notes?: string;
  bookedBy: "AI Voice Agent" | "Manual Entry" | "Web Portal";
  createdAt: string;
}

export type ViewMode = "list" | "calendar";

export interface AppointmentFilterState {
  searchQuery: string;
  statusFilter: "All" | AppointmentStatus;
  serviceFilter: string;
}
