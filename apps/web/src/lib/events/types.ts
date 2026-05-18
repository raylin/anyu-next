export type EventName =
  | "module_viewed"
  | "analyze_requested"
  | "unlock_intent_submitted"
  | "contact_submitted";

export type AppEvent = {
  name: EventName;
  moduleId: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
};
