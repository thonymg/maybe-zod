import { z } from "zod";
import { Maybe } from "../src/index";

const productSchema = z.object({
  name: z.string().min(5),
  price: z.number().positive(),
  category: z.enum(["electronics", "clothing", "books"]),
  stock: z.number().int().nonnegative()
});

type Product = z.infer<typeof productSchema>;

const invalidProduct = {
  name: "Phone",
  price: -299.99,
  category: "unknown",
  stock: -5
};

const [productErr] = Maybe<Product>(() => {}, productSchema)(invalidProduct);
console.log('Product Validation Errors:', productErr);