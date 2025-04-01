# Maybe-Zod

A lightweight TypeScript utility library that combines Zod schema validation with error handling using a Maybe monad pattern. This library provides a clean and type-safe way to validate data and handle errors without try-catch blocks.

## Features

- Type-safe validation using Zod schemas
- Synchronous and asynchronous validation support
- Clean error handling without try-catch blocks
- Zero dependencies (except for Zod)
- Full TypeScript support with type inference
- Comprehensive test coverage
- Support for complex validation scenarios
- Transformation of validated data
- Detailed error messages

## Installation

```bash
# Using npm
npm install maybe-zod

# Using yarn
yarn add maybe-zod

# Using bun
bun add maybe-zod
```

## Usage

### Basic Example

```typescript
import { z } from "zod";
import { Maybe } from "maybe-zod";

// Define your schema
const userSchema = z.object({
  name: z.string().min(2).max(50),
  age: z.number().int().positive(),
  email: z.string().email(),
});

// Define your processing function
const processUser = (user: z.infer<typeof userSchema>) => ({
  ...user,
  displayName: `${user.name} (${user.age})`
});

// Create a validated processor
const validateUser = Maybe(processUser, userSchema);

// Use it with valid data
const [error, result] = validateUser({
  name: "Alice",
  age: 30,
  email: "alice@example.com"
});
// error = null
// result = { name: "Alice", age: 30, email: "alice@example.com", displayName: "Alice (30)" }

// Use it with invalid data
const [error, result] = validateUser({
  name: "A",
  age: -5,
  email: "invalid"
});
// error contains validation messages:
// - "String must contain at least 2 character(s)"
// - "Number must be greater than 0"
// - "Invalid email"
// result = null
```

### Advanced Examples

#### 1. Complex Nested Objects

```typescript
const advancedSchema = z.object({
  id: z.string().uuid(),
  metadata: z.object({
    tags: z.array(z.string()).min(1),
    createdAt: z.date()
  })
});

const processData = (data: z.infer<typeof advancedSchema>) => data.id;
const validate = Maybe(processData, advancedSchema);

const [error, result] = validate({
  id: '123e4567-e89b-12d3-a456-426614174000',
  metadata: {
    tags: ['important', 'urgent'],
    createdAt: new Date()
  }
});
```

#### 2. Optional Fields and Discriminated Unions

```typescript
// Optional fields
const optionalSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional()
});

// Discriminated unions
const resultSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('success'), value: z.number() }),
  z.object({ type: z.literal('error'), message: z.string() })
]);

const validateResult = Maybe(
  (data) => data.type === 'success' ? data.value : 0,
  resultSchema
);

const [error, result] = validateResult({ type: 'success', value: 42 });
// result = 42
```

#### 3. Array Transformations

```typescript
const numberArraySchema = z.array(z.number());
const sum = (numbers: number[]) => numbers.reduce((a, b) => a + b, 0);
const validateSum = Maybe(sum, numberArraySchema);

const [error, result] = validateSum([1, 2, 3, 4, 5]);
// result = 15
```

### Async Validation

```typescript
import { AsyncMaybe } from "maybe-zod";

const validateUserAsync = AsyncMaybe(processUser, userSchema);

// Basic async usage
const [error, result] = await validateUserAsync(
  Promise.resolve({
    name: "Alice",
    age: 30,
    email: "alice@example.com"
  })
);

// Error handling for rejected promises
try {
  const [error, result] = await validateUserAsync(
    Promise.reject(new Error('Network error'))
  );
  // error = 'Unknown error'
  // result = null
} catch {
  // Handle any unexpected errors
}
```

## API Reference

### `Maybe<T>`

```typescript
Maybe<T>(
  fn: (params: T) => unknown,
  schema: z.ZodSchema<T>
) => (data: T) => [string | null, unknown | null]
```

Creates a validation wrapper for synchronous data processing.

#### Parameters:
- `fn`: A function that processes the validated data
- `schema`: A Zod schema that defines the shape and validation rules for the data
- Returns a function that takes input data and returns a tuple of [error, result]

### `AsyncMaybe<T>`

```typescript
AsyncMaybe<T>(
  fn: (params: T) => unknown,
  schema: z.ZodSchema<T>
) => (data: Promise<T>) => Promise<[string | null, unknown | null]>
```

Creates a validation wrapper for asynchronous data processing.

#### Parameters:
- `fn`: A function that processes the validated data
- `schema`: A Zod schema that defines the shape and validation rules for the data
- Returns a function that takes a Promise of input data and returns a Promise of [error, result]

## Error Handling

The library returns errors in a structured format:
- For validation errors, the error message contains a JSON string of all validation failures
- For async operations, unknown errors are caught and returned as 'Unknown error'
- The result is always null when an error occurs

## Best Practices

1. **Type Safety**
   - Always define your schemas with proper types
   - Use `z.infer<typeof schema>` for type inference

2. **Error Handling**
   - Always check the error value before using the result
   - Handle both validation errors and unknown errors in async operations

3. **Schema Design**
   - Keep schemas modular and reusable
   - Use schema composition for complex validations

## Testing

The library includes comprehensive tests. Run them using:

```bash
bun test
```

Test coverage includes:
- Basic validations
- Complex object validations
- Array transformations
- Async operations
- Error cases
- Edge cases



## ❤️ Contributors

This project was initiated and is maintained by [ThonyMg](https://github.com/ThonyMg). I am available for freelance work on Svelte and VueJs projects. Feel free to reach out through my [Linkedin profile](https://www.linkedin.com/company/105997457/) for collaboration opportunities.

## ⚖️ License

This project is licensed under the MIT License. For more details, see the [LICENSE](https://github.com/thonymg/maybe-zod/blob/master/license) file.

