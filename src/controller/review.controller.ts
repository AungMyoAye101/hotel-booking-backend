import { Request, RequestHandler, Response } from "express";
import { asyncCatchFn } from "../utils/asyncFunction";
import { createReviewService, getReviewsByhotelIDService, updateReviewService } from "../service/review.service";
import { successResponse } from "../common/successResponse";

export const createReviewController: RequestHandler = asyncCatchFn(
    async (req, res) => {
        const data = await createReviewService(req.validatedBody)
        successResponse(
            res,
            201,
            "Review created successfull.",
            { data }
        )
    }
)
export const updateReviewController: RequestHandler = asyncCatchFn(
    async (req, res) => {
        const data = await updateReviewService(req.validatedParams.id, req.validatedBody)
        successResponse(
            res,
            201,
            "Review updated successfull.",
            { data }
        )
    }
)
export const getReviewByHotelIDController: RequestHandler = asyncCatchFn(
    async (req, res) => {
        const data = await getReviewsByhotelIDService(req)
        successResponse(
            res,
            200,
            "Get Reviews by hotel ID successfull.",
            data
        )
    }
)