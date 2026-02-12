import mongoose, { Document } from "mongoose"

export interface IReview extends Document {
    userId: string,
    hotelId: string,
    review: string,
    rating: number
}
const reviewSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            require: true,
        },
        hotelId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hotel",
            require: true,
        },
        review: {
            type: String,
            requrie: true,

        },
        rating: {
            type: Number,
            min: 1,
            max: 9

        }
    },
    { timestamps: true }
)

const Review = mongoose.model<IReview>("Review", reviewSchema)

export default Review