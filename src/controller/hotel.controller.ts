import { Request, Response, NextFunction, RequestHandler } from "express";
import { successResponse } from "../common/successResponse";
import { createHotelService, deleteHotelService, getAllHotelsService, getHotelByIdService, getHotelByTypesService, updateHotelService } from "../service/hotel.service";
import { asyncCatchFn } from "../utils/asyncFunction";

export const createHotelController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {

        const hotel = await createHotelService(req.validatedBody)

        successResponse(
            res,
            201,
            "Hotel created succefull.",
            { hotel }
        )
    } catch (error) {
        return next(error);
    }
}
export const updateHotelController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const hotel = await updateHotelService(req.validatedParams.id, req.validatedBody)
        successResponse(
            res,
            201,
            "Hotel updated succefull.",
            { hotel }
        )
    } catch (error) {
        return next(error);
    }
}
export const deleteHotelController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        console.log(req.params);
        const hotel = await deleteHotelService(req.validatedParams.id);
        successResponse(
            res,
            200,
            "Hotel deleted successfull.",
            { hotel }
        )
    } catch (error) {
        return next(error);
    }
}
export const getHotelByIdController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const hotel = await getHotelByIdService(req.validatedParams.id);

        successResponse(
            res,
            200,
            "Get hotel by id successfull.",
            { hotel }
        )
    } catch (error) {
        return next(error);
    }
}
export const getAllHotelController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const data = await getAllHotelsService(req)
        successResponse(
            res,
            200,
            "Get all hotels successfull.",
            data
        )
    } catch (error) {
        return next(error);
    }
}
export const getHotelByTypesController: RequestHandler = asyncCatchFn(
    async (req: Request, res: Response) => {
        const hotel = await getHotelByTypesService();

        successResponse(
            res,
            200,
            "Get hotel by types successfull.",
            { hotel }
        )
    }
)
