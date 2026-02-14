import * as z from "zod";
import { paginationSchmea } from "./pagination";

export const bookingSchema = z.object({
    userId: z
        .string("user id is required."),
    roomId: z
        .string("roomId is required."),
    hotelId: z
        .string("HotelId is required."),
    name: z
        .string()
        .min(3, "Name must be contain 3 characters.")
        .optional(),
    email: z
        .email("Inavlid email")
        .transform(v => v.toLocaleLowerCase())
        .optional(),
    city: z
        .string()
        .min(1, "City is required.")
        .optional(),
    country: z
        .string()
        .min(1, "Country is required.")
        .optional(),
    phone: z
        .string()
        .regex(/^\+?[1-9]\d{7,14}$/, "Invalid phone number")
        .optional(),
    totalPrice: z
        .number("Total price must be a number")
        .positive()
        .optional(),
    quantity: z.
        number("Quantity is required,")
        .positive(),
    guest: z
        .number("Guest is required")
        .positive(),
    status: z
        .enum(["DRAFT", "PENDING", "CONFIRMED", "STAYED", "CANCELLED", "EXPIRED"])
        .default("DRAFT")
        .optional(),
    checkIn: z
        .coerce.date().refine((date) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return date >= today;
        }, "Check-in cannot be in the past."),
    checkOut: z.coerce.date()
}).refine((date) => date.checkOut > date.checkIn, {
    message: "Check out must be at least one day after check-in",
    path: ['checkOut']
})

export const updateBookingSchema = z.object({
    name: z
        .string()
        .min(3, "Name must be contain 3 characters.")
        .optional(),
    email: z
        .email("Inavlid email")
        .transform(v => v.toLocaleLowerCase())
        .optional(),
    city: z
        .string()
        .min(1, "City is required.")
        .optional(),
    country: z
        .string()
        .min(1, "Country is required.")
        .optional(),
    phone: z
        .string()
        .regex(/^\+?[1-9]\d{7,14}$/, "Invalid phone number")
        .optional(),
    status: z.enum(["PENDING", "CONFIRMED", "STAYED", "CANCELLED", "EXPIRED"]).default("PENDING"),
})

export const bookingQuerySchema = z.object({
    status: z.preprocess(
        (val) => (val === "" || val === "null" ? undefined : val),
        z.enum(["PENDING", "CONFIRMED", "STAYED", "CANCELLED", "EXPIRED"]).optional()
    ),
    sort: z.enum(['asc', 'desc'], {
        message: "Sorting must be asc or desc"
    }).optional(),
    checkIn: z.coerce.date().optional(),
    checkOut: z.coerce.date().optional()

}).merge(paginationSchmea)

export type bookingType = z.infer<typeof bookingSchema>
export type updateBookingType = z.infer<typeof updateBookingSchema>
export type bookingQueryType = z.infer<typeof bookingQuerySchema>;