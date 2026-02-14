import { successResponse } from "../common/successResponse";
import Booking from "../models/booking.model";
import { asyncCatchFn } from "../utils/asyncFunction";
import { Request, RequestHandler, Response } from "express";

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

export const cleanupController: RequestHandler = asyncCatchFn(
    async (req: Request, res: Response) => {
        const cutoff = new Date(Date.now() - FIFTEEN_MINUTES_MS);

        // 1. Delete DRAFT bookings older than 15 min from createdAt
        const draftResult = await Booking.deleteMany({
            status: "DRAFT",
            createdAt: { $lt: cutoff },
        });

        // 2. Change PENDING to EXPIRED where checkIn was more than 15 min ago
        const expiredResult = await Booking.updateMany(
            {
                status: "PENDING",
                checkIn: { $lt: cutoff },
            },
            { $set: { status: "EXPIRED" } }
        );

        return successResponse(res, 200, "Cleanup succeeded.", {
            draftsDeleted: draftResult.deletedCount,
            pendingExpired: expiredResult.modifiedCount,
        });
    }
);