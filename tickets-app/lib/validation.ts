import { z } from "zod";
import { WINE_OPTIONS } from "./event";
import { ticketPrices } from "./event";

export const checkoutSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name").max(120),
    email: z.string().trim().email("Enter a valid email address").max(254),
    phone: z
      .string()
      .trim()
      .max(30)
      .optional()
      .transform((v) => v || undefined),
    wineTriedBefore: z.enum(WINE_OPTIONS, {
      errorMap: () => ({ message: "Choose a rice wine option" }),
    }),
    gaQty: z.coerce.number().int().min(0).max(6),
    vipQty: z.coerce.number().int().min(0).max(6),
  })
  .superRefine((data, ctx) => {
    const { maxPerOrder } = ticketPrices();
    const total = data.gaQty + data.vipQty;

    if (total < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select at least one ticket",
        path: ["gaQty"],
      });
    }

    if (total > maxPerOrder) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Maximum ${maxPerOrder} tickets per order`,
        path: ["gaQty"],
      });
    }
  });

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export function formatValidationErrors(
  error: z.ZodError
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0]?.toString() || "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
