import { err, ok, type Result } from "@/lib/errors/result";

export type QueryErrorCode =
  | "query.not_found"
  | "query.unauthorized"
  | "query.database_error";

export type QueryResult<T, Code extends string = never, Meta = unknown> = Result<
  T,
  QueryErrorCode | Code,
  Meta
>;

export type QueryAccessReason = "not_found" | "unauthorized";

export type QueryAccessResult<
  Reason extends string = QueryAccessReason,
  Code extends string = never,
  Meta = unknown,
> = QueryResult<
  { allowed: boolean; reason?: Reason },
  Code,
  Meta
>;

export function queryNotFound(message = "Requested record was not found.") {
  return err("query.not_found", message);
}

export function queryUnauthorized(message = "You are not allowed to access this record.") {
  return err("query.unauthorized", message);
}

export function queryDatabaseError(message: string) {
  return err("query.database_error", message);
}

export function queryAllowed<Reason extends string = QueryAccessReason>() {
  return ok<{ allowed: boolean; reason?: Reason }>({ allowed: true });
}

export function queryDenied<Reason extends string>(reason: Reason) {
  return ok<{ allowed: boolean; reason?: Reason }>({
    allowed: false,
    reason,
  });
}
