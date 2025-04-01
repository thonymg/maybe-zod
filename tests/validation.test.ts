import { describe, expect, test } from 'vitest';
import { Maybe, AsyncMaybe } from '../src';
import { z } from "zod";

// Base validation schema
const userSchema = z.object({
  name: z.string().min(2).max(50),
  age: z.number().int().positive(),
  email: z.string().email(),
});

type User = z.infer<typeof userSchema>;

// Processing function
const processUser = (user: User) => ({
  ...user,
  displayName: `${user.name} (${user.age})`
});

describe('Maybe - Synchronous Tests', () => {
  describe('Basic Validations', () => {
    test('validates user with correct data', () => {
      const validateUser = Maybe(processUser, userSchema);
      const validUser = { name: 'Alice', age: 30, email: 'alice@example.com' };
      
      const [error, result] = validateUser(validUser);
      
      expect(error).toBeNull();
      expect(result).toEqual({
        ...validUser,
        displayName: 'Alice (30)'
      });
    });

    test('rejects user with invalid data', () => {
      const validateUser = Maybe(processUser, userSchema);
      const invalidUser = { name: 'A', age: -5, email: 'invalid' };
      
      const [error, result] = validateUser(invalidUser);
      
      expect(error).not.toBeNull();
      expect(result).toBeNull();
      expect(JSON.parse(error!)).toEqual(expect.arrayContaining([
        expect.objectContaining({
          message: 'String must contain at least 2 character(s)'
        }),
        expect.objectContaining({
          message: 'Number must be greater than 0'
        }),
        expect.objectContaining({
          message: 'Invalid email'
        })
      ]));
    });
  });

  describe('Advanced Validations', () => {
    test('validates complex schema with UUID and metadata', () => {
      const advancedSchema = z.object({
        id: z.string().uuid(),
        metadata: z.object({
          tags: z.array(z.string()).min(1),
          createdAt: z.date()
        })
      });
      
      const processData = (data: z.infer<typeof advancedSchema>) => data.id;
      const validate = Maybe(processData, advancedSchema);
      
      const validData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        metadata: {
          tags: ['important', 'urgent'],
          createdAt: new Date()
        }
      };
      
      const [error, result] = validate(validData);
      
      expect(error).toBeNull();
      expect(result).toBe(validData.id);
    });

    test('correctly transforms array of numbers', () => {
      const schema = z.array(z.number());
      const sum = (numbers: number[]) => numbers.reduce((a, b) => a + b, 0);
      const validate = Maybe(sum, schema);
      
      const [error, result] = validate([1, 2, 3, 4, 5]);
      
      expect(error).toBeNull();
      expect(result).toBe(15);
    });

    test('validates and transforms boolean value', () => {
      const boolSchema = z.boolean();
      const invert = (val: boolean) => !val;
      const validate = Maybe(invert, boolSchema);
      
      const [error, result] = validate(true);
      
      expect(error).toBeNull();
      expect(result).toBe(false);
    });
  });

  describe('Structural Validations', () => {
    test('validates nested structure with preferences', () => {
      const nestedSchema = z.object({
        user: userSchema,
        preferences: z.object({
          theme: z.enum(['light', 'dark']),
          notifications: z.boolean()
        })
      });
      
      const validate = Maybe(data => data.user.name, nestedSchema);
      
      const data = {
        user: { name: 'Bob', age: 25, email: 'bob@example.com' },
        preferences: { theme: 'dark' as const, notifications: true }
      };
      
      const [error, result] = validate(data);
      
      expect(error).toBeNull();
      expect(result).toBe('Bob');
    });

    test('validates empty array', () => {
      const arraySchema = z.array(z.string());
      const validate = Maybe((arr: string[]) => arr.length, arraySchema);
      
      const [error, result] = validate([]);
      
      expect(error).toBeNull();
      expect(result).toBe(0);
    });

    test('validates object with optional values', () => {
      const optionalSchema = z.object({
        title: z.string(),
        description: z.string().optional(),
        tags: z.array(z.string()).optional()
      });
      
      const validate = Maybe((data) => data.title, optionalSchema);
      
      const [error, result] = validate({ title: 'Test' });
      
      expect(error).toBeNull();
      expect(result).toBe('Test');
    });

    test('validates discriminated union', () => {
      const resultSchema = z.discriminatedUnion('type', [
        z.object({ type: z.literal('success'), value: z.number() }),
        z.object({ type: z.literal('error'), message: z.string() })
      ]);
      
      const validate = Maybe((data) => data.type === 'success' ? data.value : 0, resultSchema);
      
      const [error, result] = validate({ type: 'success', value: 42 });
      
      expect(error).toBeNull();
      expect(result).toBe(42);
    });

    test('rejects invalid discriminated union', () => {
      const resultSchema = z.discriminatedUnion('type', [
        z.object({ type: z.literal('success'), value: z.number() }),
        z.object({ type: z.literal('error'), message: z.string() })
      ]);
      
      const validate = Maybe((data) => data.type === 'success' ? data.value : 0, resultSchema);
      
      const [error, result] = validate({ type: 'unknown', value: 42 } as any);
      
      expect(error).not.toBeNull();
      expect(result).toBeNull();
    });

    test('validates string transformation', () => {
      const schema = z.string().transform(str => str.toUpperCase());
      const validate = Maybe((str: string) => str.length, schema);
      
      const [error, result] = validate('test');
      
      expect(error).toBeNull();
      expect(result).toBe(4);
    });

    test('validates number with constraints', () => {
      const schema = z.number()
        .int()
        .positive()
        .max(100);
      const validate = Maybe((n: number) => n * 2, schema);
      
      const [error, result] = validate(42);
      
      expect(error).toBeNull();
      expect(result).toBe(84);
    });
  });
});

describe('AsyncMaybe - Asynchronous Tests', () => {
  describe('Basic Validations', () => {
    test('validates async data correctly', async () => {
      const validateUser = AsyncMaybe(processUser, userSchema);
      const userPromise = Promise.resolve({ name: 'Alice', age: 30, email: 'alice@example.com' });
      
      const [error, result] = await validateUser(userPromise);
      
      expect(error).toBeNull();
      expect(result).toEqual({
        name: 'Alice',
        age: 30,
        email: 'alice@example.com',
        displayName: 'Alice (30)'
      });
    });

    test('rejects invalid async data', async () => {
      const validateUser = AsyncMaybe(processUser, userSchema);
      const userPromise = Promise.resolve({ name: 'B', age: 0, email: 'invalid' });
      
      const [error, result] = await validateUser(userPromise);
      
      expect(error).not.toBeNull();
      expect(result).toBeNull();
      expect(JSON.parse(error!)).toEqual(expect.arrayContaining([
        expect.objectContaining({
          message: 'String must contain at least 2 character(s)'
        }),
        expect.objectContaining({
          message: 'Number must be greater than 0'
        }),
        expect.objectContaining({
          message: 'Invalid email'
        })
      ]));
    });
  });

  describe('Error Handling', () => {
    test('handles rejected promises', async () => {
      const validateUser = AsyncMaybe(processUser, userSchema);
      const failingPromise = Promise.reject(new Error('Network error'));
      
      const [error, result] = await validateUser(failingPromise);
      
      expect(error).toBe('Unknown error');
      expect(result).toBeNull();
    });

    test('validates with custom async schema', async () => {
      const asyncSchema = z.object({
        username: z.string(),
        token: z.string().refine(
          async () => {
            await new Promise(resolve => setTimeout(resolve, 10));
            return true;
          },
          { message: 'Invalid token' }
        )
      });
      
      const validate = AsyncMaybe(data => data.username, asyncSchema);
      const data = { username: 'admin', token: 'valid-token' };
      
      const [error, result] = await validate(Promise.resolve(data));
      
      expect(error).toBeNull();
      expect(result).toBe('admin');
    });
  });

  describe('Advanced Cases', () => {
    test('handles delayed promises', async () => {
      const validateUser = AsyncMaybe(processUser, userSchema);
      const delayedPromise = new Promise<User>(resolve => {
        setTimeout(() => {
          resolve({ name: 'Charlie', age: 42, email: 'charlie@example.com' });
        }, 50);
      });
      
      const [error, result] = await validateUser(delayedPromise);
      
      expect(error).toBeNull();
      expect(result).toEqual({
        name: 'Charlie',
        age: 42,
        email: 'charlie@example.com',
        displayName: 'Charlie (42)'
      });
    });

    test('validates complex types asynchronously', async () => {
      interface ComplexData {
        items: Array<{id: number, value: string}>;
        count: number;
      }
      
      const complexSchema = z.object({
        items: z.array(z.object({
          id: z.number(),
          value: z.string()
        })).min(1),
        count: z.number().int()
      });
      
      const process = (data: ComplexData) => data.items.map(item => item.value);
      const validate = AsyncMaybe(process, complexSchema);
      
      const data = {
        items: [
          { id: 1, value: 'one' },
          { id: 2, value: 'two' }
        ],
        count: 2
      };
      
      const [error, result] = await validate(Promise.resolve(data));
      
      expect(error).toBeNull();
      expect(result).toEqual(['one', 'two']);
    });

    test('validates promise chain', async () => {
      const chainSchema = z.string().min(5);
      const validate = AsyncMaybe(
        (str: string) => str.toUpperCase(),
        chainSchema
      );
      
      const promise = Promise.resolve('hello')
        .then(str => str + ' world');
      
      const [error, result] = await validate(promise);
      
      expect(error).toBeNull();
      expect(result).toBe('HELLO WORLD');
    });

    test('handles timeouts in promises', async () => {
      const validateUser = AsyncMaybe(processUser, userSchema);
      const timeoutPromise = new Promise<User>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 100);
      });
      
      const [error, result] = await validateUser(timeoutPromise);
      
      expect(error).toBe('Unknown error');
      expect(result).toBeNull();
    });

    test('validates async transformation', async () => {
      const schema = z.string();
      const validate = AsyncMaybe(
        async (str: string) => str.toUpperCase(),
        schema
      );
      
      const [error, result] = await validate(Promise.resolve('test'));
      
      expect(error).toBeNull();
      const upperResult = await result;
      expect(upperResult).toBe('TEST');
    });

    test('handles JSON parsing errors', async () => {
      const jsonSchema = z.string().transform((str) => JSON.parse(str));
      const validate = AsyncMaybe((data) => data, jsonSchema);
      
      const [error, result] = await validate(Promise.resolve('invalid json'));
      
      expect(error).not.toBeNull();
      expect(result).toBeNull();
    });

    test('validates schema with circular dependencies', async () => {
      type TreeNode = {
        value: string;
        children: TreeNode[];
      };
      
      const treeSchema: z.ZodType<TreeNode> = z.lazy(() => 
        z.object({
          value: z.string(),
          children: z.array(treeSchema)
        })
      );
      
      const validate = AsyncMaybe(
        (tree: TreeNode) => tree.value,
        treeSchema
      );
      
      const data = {
        value: 'root',
        children: [
          { value: 'child', children: [] }
        ]
      };
      
      const [error, result] = await validate(Promise.resolve(data));
      
      expect(error).toBeNull();
      expect(result).toBe('root');
    });

    test('validates with multiple async refinements', async () => {
      const refinementSchema = z.object({
        email: z.string().email(),
        password: z.string()
      }).refine(
        async (data) => {
          await new Promise(resolve => setTimeout(resolve, 10));
          return data.password.length >= 8;
        },
        { message: 'Password too short' }
      ).refine(
        async (data) => {
          await new Promise(resolve => setTimeout(resolve, 10));
          return /[A-Z]/.test(data.password);
        },
        { message: 'Must contain uppercase letter' }
      );
      
      const validate = AsyncMaybe((data) => data.email, refinementSchema);
      
      const validData = {
        email: 'test@example.com',
        password: 'Password123'
      };
      
      const [error, result] = await validate(Promise.resolve(validData));
      
      expect(error).toBeNull();
      expect(result).toBe('test@example.com');
    });
  });
}); 