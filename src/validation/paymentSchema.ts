import * as z from "zod";
import { paginationSchmea } from "./pagination";

export const createPaymentSchema = z.object({
    bookingId: z.string("Booking id is required."),
    userId: z.string("User  id is required."),
    paymentMethod: z.enum(["MOBILE_BANKING", "CARD", "BANK"],
        "Payment method must be one of Mobile banking ,card or bank."),
    amount: z.number().positive(),
    payNow: z.boolean().optional()
}).refine((data) => data.payNow === true, {
    message: "Pay now is required.",
    path: ['payNow']
})

export const updatePaymnetSchema = z.object({
    userId: z.string("User  id is required."),
    paymentId: z.string("Payment  id is required."),
    bookingId: z.string("Booking id is required."),
})

export const paymentQuerySchema = z.object({
    status: z.preprocess(
        (val) => (val === "" || val === "null" || val === "all" ? undefined : val),
        z.enum(["PENDING", "PAID", "FAILED"]).optional()
    ),
    sort: z.enum(['asc', 'desc'], {
        message: "Sorting must be asc or desc"
    }).optional(),


}).merge(paginationSchmea)


export type createPaymentType = z.infer<typeof createPaymentSchema>;
export type updatePaymentType = z.infer<typeof updatePaymnetSchema>;
export type paymentQueryType = z.infer<typeof paymentQuerySchema>;