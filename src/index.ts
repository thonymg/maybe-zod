import { z } from "zod";

/**
 * A utility function that applies a given function to data validated by a Zod schema.
 *
 * @template T - The type of the input data.
 * @template U - The type of the output data after applying the function.
 * @param {function} fn - A function that takes validated data of type T and returns data of type U.
 * @param {z.ZodSchema<T>} schema - A Zod schema used to validate the input data.
 * @returns {[string | null, U | null]} - A array where the first element is an error message (if any) and the second element is the result of applying the function to the validated data, or null if validation fails.
 */
export const Maybe = <T, U>(fn: (params: T) => U, schema: z.ZodSchema<T>) => (data: T): [string | null, U | null] => {
  const result = schema.safeParse(data);

  return result.success
      ? [null, fn(result.data)]
      : [result.error?.message , null];
};

/**
 * A utility function that asynchronously applies a given function to data validated by a Zod schema.
 *
 * @template T - The type of the input data.
 * @template U - The type of the output data after applying the function.
 * @param {function} fn - A function that takes validated data of type T and returns data of type U.
 * @param {z.ZodSchema<T>} schema - A Zod schema used to validate the input data.
 * @returns {Promise<[string | null, U | null]>} - A promise that resolves to a array where the first element is an error message (if any) and the second element is the result of applying the function to the validated data, or null if validation fails.
 */
export const AsyncMaybe = <T, U>(fn: (params: T) => U, schema: z.ZodSchema<T>) => async (data: Promise<T>): Promise<[string | null, U | null]> => {
  try {
    const result = await schema.safeParseAsync(await data);

    return result.success ? [null, fn(result.data)] : [result.error?.message , null];
  } catch (error) {
    return ['Unknown error', null];
  }
};