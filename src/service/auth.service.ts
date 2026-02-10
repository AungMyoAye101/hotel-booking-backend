import { BadRequestError, NotFoundError, UnAuthorizedError } from "../common/errors";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../common/jwt";
import { comparedPassword, hashPassword } from "../common/password";
import User from "../models/user.model"
import { loginType, registerType } from "../validation/authSchema";
import { Request } from "express";


export const registerService = async (
    { name, email, password }: registerType
) => {
    const exitUser = await User.exists({ email });
    if (exitUser) {
        throw new BadRequestError("User already exit.");
    }
    const hashed = await hashPassword(password);
    const user = new User({
        name,
        email,
        password: hashed
    })
    const access_token = await generateAccessToken({
        id: user._id as string
        , email: user.email,
    })
    const refresh_token = await generateRefreshToken({
        id: user._id as string
        , email: user.email,
    })

    user.token = refresh_token;
    await user.save();
    return {
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,

        },
        access_token,
        refresh_token
    }

}
export const loginService = async (
    { email, password }: loginType
) => {
    const user = await User.findOne({ email }).select("_id password name email ")
    if (!user) {
        throw new NotFoundError("User not found.")
    }
    const isMatch = await comparedPassword(password, user.password);
    if (!isMatch) {
        throw new BadRequestError("Invalid credential");
    }
    const access_token = await generateAccessToken({ id: user._id as string, email: user.email, })
    const refresh_token = await generateRefreshToken({ id: user._id as string, email: user.email, })

    user.token = refresh_token;
    await user.save();
    return {
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
        },
        access_token,
        refresh_token
    }

}

export const logoutService = async (id: string) => {
    return await User.updateOne(
        { _id: id },
        {
            $unset: { token: "" }
        })
}

export const refreshService = async (
    req: Request
) => {
    const token = req.cookies.refresh_token
    console.log(token, "toekn")

    if (!token) {
        throw new BadRequestError("Token is required.")
    }
    const decoded = await verifyRefreshToken(token);
    if (!decoded) {
        throw new UnAuthorizedError("Your are not authenticated.")
    }
    const user = await User.findById(decoded.id).select("+token -password");


    if (!user) {
        throw new NotFoundError("User not found.")
    }
    const access_token = generateAccessToken({
        id: user._id as string,
        email: user.email,

    })
    const refresh_token = generateRefreshToken({
        id: user._id as string,
        email: user.email,

    })
    user.token = refresh_token;
    await user.save();
    return {
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
        }, access_token, refresh_token
    }
}

export const currentUserService = async (req: Request) => {
    const token = req.cookies.refresh_token;

    if (!token) {
        throw new BadRequestError("Token is required.")
    }
    const decoded = await verifyRefreshToken(token);
    if (!decoded) {
        throw new UnAuthorizedError("Your are not authenticated.")
    }
    const user = await User.findById(decoded.id).select(" -password");


    if (!user) {
        throw new NotFoundError("User not found.")
    }
    return user;

}

