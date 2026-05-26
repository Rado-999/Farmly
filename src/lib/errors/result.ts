export type ResultError<Code extends string = string, Meta = unknown> = {
  code: Code;
  message: string;
  meta?: Meta;
};

export type OkResult<T = void> = {
  ok: true;
  data: T;
};

export type ErrResult<Code extends string = string, Meta = unknown> = {
  ok: false;
  error: ResultError<Code, Meta>;
};

export type Result<T = void, Code extends string = string, Meta = unknown> =
  | OkResult<T>
  | ErrResult<Code, Meta>;

export function ok(): OkResult<void>;
export function ok<T>(data: T): OkResult<T>;
export function ok<T>(data?: T): OkResult<T | void> {
  return { ok: true, data: data as T };
}

export function err<Code extends string, Meta = unknown>(
  code: Code,
  message: string,
  meta?: Meta,
): ErrResult<Code, Meta> {
  return {
    ok: false,
    error: {
      code,
      message,
      ...(meta === undefined ? {} : { meta }),
    },
  };
}
