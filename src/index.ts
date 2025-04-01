import { z } from "zod";

export const Maybe = <T>(fn: (params: T) => unknown, schema: z.ZodSchema<T>) => (data: T): [string | null, unknown | null] => {
  const result = schema.safeParse(data);

  return result.success 
      ? [null, fn(result.data)] 
      : [result.error?.message , null];
};

export const AsyncMaybe = <T>(fn: (params: T) => unknown, schema: z.ZodSchema<T>) => async (data: Promise<T>): Promise<[string | null, unknown | null]> => {
  try {
    const result = await schema.safeParseAsync(await data); 

    return result.success ? [null, fn(result.data)] : [result.error?.message , null];
  } catch (error) {
    return ['Unknown error', null];
  }
}; 