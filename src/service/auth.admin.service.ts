import { BadRequestError, NotFoundError, UnAuthorizedError } from "../common/errors";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../common/jwt";
import { comparedPassword, hashPassword } from "../common/password";
import Admin from "../models/admin.model";
import { loginType, registerType } from "../validation/authSchema";
import { Request } from "express";

export const adminRegisterService = async (
    { name, email, password }: registerType
) => {
    const exitingUser = await Admin.exists({ email });
    if (exitingUser) {
        throw new BadRequestError("Email is already exit.")
    }
    const hashedPassword = await hashPassword(password);
    const user = new Admin({
        name,
        email,
        password: hashedPassword
    });
    const access_token = generateAccessToken({
        id: user._id.toString(),
        email: user.email,
        role: "admin"
    })
    const refresh_token = generateRefreshToken({
        id: user._id.toString(),
        email: user.email,
        role: "admin"
    })
    user.token = refresh_token;
    await user.save()
    return {
        user: {
            _id: user._id,
            name: user.name,
            email: user.email
        }, access_token, refresh_token
    }
}
export const adminLoginService = async (
    { email, password }: loginType
) => {
    const user = await Admin.findOne({ email })
    if (!user) {
        throw new NotFoundError("Invalid email or password,")
    }
    const isMatch = await comparedPassword(password, user.password);
    if (!isMatch) {
        throw new BadRequestError("Invalid email or password,")
    }
    const access_token = generateAccessToken({
        id: user._id.toString(),
        email: user.email,
        role: user.role,
    })
    const refresh_token = generateRefreshToken({
        id: user._id.toString(),
        email: user.email,
        role: user.role,
    })
    user.token = refresh_token;
    await user.save()
    return {
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        }, access_token, refresh_token
    }
}
export const adminLogoutService = async (id: string) => {
    return await Admin.findByIdAndUpdate(id, {
        $unset: { token: "" }
    })
}

export const adminRefreshService = async (
    req: Request
) => {
    const token = req.cookies.refresh_token;

    if (!token) {
        throw new UnAuthorizedError("Token is required.");
    }
    const decoded = await verifyRefreshToken(token);
    const user = await Admin.findById(decoded.id).select("-password -token");

    if (!user) {
        throw new UnAuthorizedError("Admin not found.")
    }
    const access_token = generateAccessToken({
        id: user._id.toString(),
        email: user.email,
        role: user.role,

    })
    const refresh_token = generateRefreshToken({
        id: user._id.toString(),
        email: user.email,
        role: user.role,

    })
    user.token = refresh_token;
    await user.save();
    return {
        user: {
            _id: user._id,
            name: user.name,
            email: user.email
        }, access_token, refresh_token
    }
}