import { BadRequestError, NotFoundError } from "../common/errors";
import Review from "../models/review.model";
import { checkMongoDbId } from "../utils/checkMongoDbId";
import { createReviewType } from "../validation/reviewSchema";
import { Request } from "express";


export const createReviewService = async (
    data: createReviewType
) => {
    const [userId, hotelId] = checkMongoDbId([data.userId, data.hotelId]);
    console.log(data, "data")

    const review = await Review.create(data);
    if (!review) {
        throw new BadRequestError("Failed to create review")
    }
    return review;
}
export const updateReviewService = async (
    id: string,
    data: createReviewType
) => {

    const review = await Review.findByIdAndUpdate(id, { data });
    if (!review) {
        throw new NotFoundError("Review not found.")
    }
    return review;
}

export const getReviewsByhotelIDService = async (
    req: Request
) => {
    const { hotelId } = req.validatedParams;
    const { page = 1, limit = 10 } = req.validatedQuery;
    const skip = (page - 1) * limit;
    const reviews = await Review.find({ hotelId })
        .populate({
            path: "userId",
            select: "name"
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
    if (!reviews) {
        throw new NotFoundError("Reviews not found.")
    }
    return reviews;
}