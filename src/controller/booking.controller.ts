import { Request, RequestHandler, Response } from "express";
import { asyncCatchFn } from "../utils/asyncFunction";
import { successResponse } from "../common/successResponse";
import { canecelBookingService, createBookingService, getAllBookingByRoomIdService, getALlBookingsService, getBookingById, getBookingByUserIdService, updateBookingService } from "../service/booking.service";

export const createBookingController: RequestHandler = asyncCatchFn(
    async (
        req: Request,
        res: Response
    ) => {
        const booking = await createBookingService(req.validatedBody);
        successResponse(
            res,
            201,
            "Booking created successful.",
            { booking }
        )
    }
)
export const updateBookingController: RequestHandler = asyncCatchFn(
    async (
        req: Request,
        res: Response
    ) => {

        const booking = await updateBookingService(req.validatedParams.id, req.validatedBody);
        successResponse(
            res,
            201,
            "Booking updated successfull.",
            { booking }
        )
    }
)
export const getAllBookingByRoomIdController: RequestHandler = asyncCatchFn(
    async (
        req: Request,
        res: Response
    ) => {
        const data = await getAllBookingByRoomIdService(req);
        successResponse(
            res,
            200,
            "Get all booking  successfull.",
            data
        )
    }
)

export const getAllBookingsController: RequestHandler = asyncCatchFn(
    async (
        req: Request,
        res: Response,
    ) => {
        const data = await getALlBookingsService(req);

        successResponse(
            res,
            200,
            "Get all booking success.",
            data
        )
    }
)

export const getBookingByIdController: RequestHandler = asyncCatchFn(
    async (
        req: Request,
        res: Response
    ) => {
        const booking = await getBookingById(req.validatedParams.bookingId);
        successResponse(
            res,
            200,
            "Get  booking success.",
            { booking }
        )
    }
)


export const getBookingByUserIdController: RequestHandler = asyncCatchFn(
    async (
        req: Request,
        res: Response
    ) => {
        const booking = await getBookingByUserIdService(req.validatedParams.userId);
        successResponse(
            res,
            200,
            "Get booking by user id success.",
            { booking }
        )
    }
)

export const cancelBookingController: RequestHandler = asyncCatchFn(
    async (
        req: Request,
        res: Response
    ) => {
        const booking = await canecelBookingService(req.validatedParams.id);
        successResponse(
            res,
            200,
            "Booking cancelled.",
            { booking }
        )
    }
)