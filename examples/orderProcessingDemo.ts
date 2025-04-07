import { z } from "zod";
import { Maybe } from "../src/index";

const orderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().min(1)
  })).min(1),
  total: z.number().positive(),
  shippingAddress: z.object({
    street: z.string().min(5),
    city: z.string().min(3),
    zip: z.string().regex(/^\d{5}$/)
  })
});

type Order = z.infer<typeof orderSchema>;

const invalidOrder: any = {
  items: [],
  total: 0,
  shippingAddress: {
    street: "123",
    city: "NY",
    zip: "ABCDE"
  }
};

const [orderErr] = Maybe<Order, string>(() => {return 'error'}, orderSchema)(invalidOrder);
console.log('Order Processing Errors:', orderErr);