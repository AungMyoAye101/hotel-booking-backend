import { Request, RequestHandler, Response } from "express";
import { successResponse } from "../common/successResponse";
import { asyncCatchFn } from "../utils/asyncFunction";
import {
    getAllUsersService,
    getUserByIdService,
    updateUserService
} from "../service/user.service";
import { currentUserService } from "../service/auth.service";

export const getAllUsersController: RequestHandler =
    asyncCatchFn(async (
        req: Request,
        res: Response,
    ) => {
        const data = await getAllUsersService(req);
        successResponse(
            res,
            200,
            "Get all users success.",
            data
        )
    });
export const getUserByIdController: RequestHandler =
    asyncCatchFn(async (
        req: Request,
        res: Response,
    ) => {
        const user = await getUserByIdService(req.validatedParams.userId);
        successResponse(
            res,
            200,
            "Get  user by id  success.",
            { user }
        )
    });
export const updateUserController: RequestHandler =
    asyncCatchFn(async (
        req: Request,
        res: Response,
    ) => {
        const user = await updateUserService(req.validatedParams.userId, req.validatedBody);
        successResponse(
            res,
            201,
            "Update  user by id  successful.",
            { user }
        )
    });

export const getCurrentUserController: RequestHandler =
    asyncCatchFn(async (
        req: Request,
        res: Response,
    ) => {
        const user = await currentUserService(req)
        successResponse(
            res,
            200,
            "Get current user successful.",
            { user }
        )
    })