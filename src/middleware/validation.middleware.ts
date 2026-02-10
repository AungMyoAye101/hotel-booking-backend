import * as z from "zod";
import { Request, Response, NextFunction } from "express"
import { ValidationError } from "../common/errors";
import mongoose from "mongoose";


type validationPropsType = {
    schema: z.Schema<any>,
    target: "BODY" | "PARAMS" | "QUERY"
}
const validation = (props: validationPropsType) => {
    return (
        req: Request,
        _res: Response,
        next: NextFunction,
    ) => {

        const dataToValidate = props.target === "BODY" ? req.body :
            props.target === "PARAMS" ? req.params :
                req.query;

        const { success, error, data } = props.schema.safeParse(dataToValidate)
        //check validation is success or not
        if (!success) {
            const formattedError = error.issues.map((err) => ({
                path: err.path.join(','),
                message: err.message
            }
            ))
            throw new ValidationError(formattedError)
        }

        if (props.target === "BODY") {
            req.validatedBody = data;
        } else if (props.target === "PARAMS") {
            req.validatedParams = data;
        } else {
            req.validatedQuery = data
        }
        next()
    }
}

export const validateRequestBody = (schema: z.Schema<any>) => {
    return validation({ schema, target: "BODY", })
}
export const validateRequestParams = (schema: z.Schema<any>) => {
    return validation({ schema, target: "PARAMS", })
}
export const validateRequestQuery = (schema: z.Schema<any>) => {
    return validation({ schema, target: "QUERY", })
}

export const checkMongoDBId = (ids: string[]) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        for (const id of ids) {

            const mongoId = req.params[id];

            if (!mongoose.Types.ObjectId.isValid(mongoId as string)) {
                throw new ValidationError([{
                    "message": "Invalid mongoId error.",
                    "path": `Mogodb Id ${mongoId}`,
                }]);

            };
            req.validatedParams = { [id]: mongoId };

        };
        next()
    };
};