import type { FollowNotifyLevel } from "@/lib/marketplace/follows";
import type { SupabaseClient } from "@supabase/supabase-js";

import { logger } from "@/lib/logger";
import { err, ok, type Result } from "@/lib/errors/result";

export type DigestDeliveryKind = "digest" | "harvest" | "season" | "event";

export type RecordNotificationDeliveryResult = Result<
  void,
  "notification.delivery_record_failed"
>;

/** Records a sent notification (weekly cron will call this later). */
export async function recordNotificationDelivery(
  supabase: SupabaseClient,
  userId: string,
  kind: DigestDeliveryKind,
  payload: Record<string, unknown>,
): Promise<RecordNotificationDeliveryResult> {
  const { error } = await supabase.from("notification_deliveries").insert({
    user_id: userId,
    kind,
    payload,
  });

  if (error) {
    logger.error({
      operation: "notifications.recordNotificationDelivery",
      message: "Failed to record notification delivery.",
      userId,
      errorCode: error.code ?? "notification.delivery_record_failed",
      context: { kind, payloadKeys: Object.keys(payload) },
      error,
    });

    return err("notification.delivery_record_failed", error.message);
  }

  return ok();
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
