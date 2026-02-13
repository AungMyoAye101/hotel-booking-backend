import { Request, RequestHandler, Response } from "express";
import { asyncCatchFn } from "../utils/asyncFunction";
import { successResponse } from "../common/successResponse";
import { getALlReceiptByUserIdService, getALlReceiptService } from "../service/receipt.service";

export const getAllReceiptController: RequestHandler = asyncCatchFn(
    async (req: Request, res: Response) => {
        const data = await getALlReceiptService(req);
        successResponse(
            res,
            200,
            "Get All receipt.",
            { data }
        )
    }
)
export const getAllReceiptByUserIdController: RequestHandler = asyncCatchFn(
    async (req: Request, res: Response) => {
        const data = await getALlReceiptByUserIdService(req);
        successResponse(
            res,
            200,
            "Get All receipt by user id.",
            { data }
        )
    }
)