import jwt from "jsonwebtoken";
import { TokenPayload } from "../types/type";
import dotenv from "dotenv";
import { UnAuthorizedError } from "./errors";
dotenv.config();
const ACCESS_TOKEN = process.env.ACCESS_SECRET_KEY;
const REFRESH_TOKEN = process.env.REFRESH_SECRET_KEY;
const access_token_expire = process.env.NODE_ENV === "production" ? "15min" : "1day"
if (!ACCESS_TOKEN || !REFRESH_TOKEN) {
    throw new Error("Tokens are required.")
}

export const generateAccessToken = (
    payload: TokenPayload
) => {
    return jwt.sign(payload, ACCESS_TOKEN, { expiresIn: access_token_expire })
}

export const verifyAccessToken = (
    token: string
): any => {
    try {
        return jwt.verify(token, ACCESS_TOKEN) as TokenPayload;
    } catch (error) {
        console.log(error)
    }

}
export const generateRefreshToken = (
    payload: TokenPayload
) => {
    return jwt.sign(payload, REFRESH_TOKEN, { expiresIn: "7days" })
}

export const verifyRefreshToken = async (
    token: string
): Promise<TokenPayload> => {
    try {
        return jwt.verify(token, REFRESH_TOKEN) as TokenPayload

    } catch (error) {
        console.log(error)
        throw new UnAuthorizedError("Your are not authorized.")
    }
}
