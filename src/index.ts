import { z } from "zod";

export const Maybe = <T, U>(fn: (params: T) => U, schema: z.ZodSchema<T>) => (data: T): [string | null, U | null] => {
  const result = schema.safeParse(data);

  return result.success
      ? [null, fn(result.data)]
      : [result.error?.message , null];
};

export const AsyncMaybe = <T, U>(fn: (params: T) => U, schema: z.ZodSchema<T>) => async (data: Promise<T>): Promise<[string | null, U | null]> => {
  try {
    const result = await schema.safeParseAsync(await data);

    return result.success ? [null, fn(result.data)] : [result.error?.message , null];
  } catch (error) {
    return ['Unknown error', null];
  }
};