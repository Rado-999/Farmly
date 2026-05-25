import type { FollowNotifyLevel } from "@/lib/marketplace/follows";
import type { SupabaseClient } from "@supabase/supabase-js";

export type DigestDeliveryKind = "digest" | "harvest" | "season" | "event";

/** Records a sent notification (weekly cron will call this later). */
export async function recordNotificationDelivery(
  supabase: SupabaseClient,
  userId: string,
  kind: DigestDeliveryKind,
  payload: Record<string, unknown>,
) {
  return supabase.from("notification_deliveries").insert({
    user_id: userId,
    kind,
    payload,
  });
}

/** Farmers whose updates qualify for the given notify level. */
export function shouldNotifyForLevel(
  level: FollowNotifyLevel,
  eventKind: DigestDeliveryKind,
): boolean {
  if (level === "off") {
    return false;
  }

  if (level === "digest") {
    return eventKind === "digest";
  }

  if (level === "harvest") {
    return eventKind === "digest" || eventKind === "harvest";
  }

  return true;
}
