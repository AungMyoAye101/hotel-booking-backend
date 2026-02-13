import { successResponse } from "../common/successResponse";
import { getTotalBooking, getTotalRevenueService, totalService } from "../service/analytic.service";
import { asyncCatchFn } from "../utils/asyncFunction";
import { Request, RequestHandler, Response } from "express";
export const getTotalRevenueController: RequestHandler = asyncCatchFn(
    async (
        req: Request,
        res: Response
    ) => {
        const data = await getTotalRevenueService()

        successResponse(
            res,
            200,
            "Get all payment total",
            data
        )
    }
)

export const getTotalController: RequestHandler = asyncCatchFn(
    async (
        req: Request,
        res: Response
    ) => {
        const data = await totalService();
        successResponse(
            res,
            200,
            "Get all  total",
            data
        )
    }
)
export const getTotalBookingController: RequestHandler = asyncCatchFn(
    async (
        req: Request,
        res: Response
    ) => {
        const data = await getTotalBooking();
        successResponse(
            res,
            200,
            "Get all  total Booking",
            data
        )
    }
)