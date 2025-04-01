import { z, ZodError } from "zod";

export const profileValidator = z.object({
  name: z.string().max(10),
  email: z.string().email(),
});



export type Profile = z.infer<typeof profileValidator>;
const MaybeFunction = <T>(fn: (params: T) => unknown, schema: z.ZodSchema<T>) => (data: T): [string | null, unknown | null] => {
    const result = schema.safeParse(data);

    return result.success 
        ? [null, fn(result.data)] 
        : [result.error?.message , null];
};

const AsyncMaybeFunction =  <T>(fn: (params: T) => unknown, schema: z.ZodSchema<T>) => async (data: Promise<T>): Promise<[string | null, unknown | null]> => {
    try {
        const result = await schema.safeParseAsync(await data); 

        return result.success ? [null, fn(result.data)] : [result.error?.message , null];
    } catch (error) {
        return ['Unknown error', null];
    }
};

type Data = {
    name: string;
    email: string;
    below: number;
}

const data = {
  name: "John Doe 0000 0000 000",
  email: "john.doe@example.com",
  below: 100,
};


const safeFunction = MaybeFunction<Profile>(data => {
 return  data.name
}, profileValidator)

const result = safeFunction(data)

console.log(result[0]);

// Exemple d'utilisation de la validation asynchrone
const asyncSafeFunction = AsyncMaybeFunction<Profile>(data => {
    return data.name;
}, profileValidator);

const resultAsync = await asyncSafeFunction(Promise.resolve(data))

console.log(resultAsync[0])
