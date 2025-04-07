import { Maybe, AsyncMaybe } from "../src/index";
import { z } from "zod";

const userSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  age: z.number().min(18).max(120)
});


type User = z.infer<typeof userSchema>;
const invalidUser = {
  username: "JD",
  email: "john.doe",
  password: "weakpass",
  age: 17
};

const [userErr] = Maybe<User, string>(() => {return 'error'}, userSchema)(invalidUser);
console.log('User Registration Errors:', userErr);


AsyncMaybe<User, string>(() => {return 'error'}, userSchema)(Promise.resolve(invalidUser))
  .then(([asyncErr]) => {
    console.log('\nAsync User Registration Errors:', asyncErr);
  });