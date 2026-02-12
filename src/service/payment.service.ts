import mongoose from "mongoose";
import { BadRequestError, NotFoundError } from "../common/errors";
import Payment from "../models/payment.model";
import { checkMongoDbId } from "../utils/checkMongoDbId";
import { createPaymentType, paymentQueryType, updatePaymentType } from "../validation/paymentSchema";
import Receipt from "../models/receipt.model";
import { Request } from "express";
import { paginationResponseFormater } from "../utils/paginationResponse";
import Booking from "../models/booking.model";
import { resend, sendPaymentEmail } from "../utils/resend";


//create
export const createPaymentService = async (
    data: createPaymentType
) => {

    const [userId, bookingId] = checkMongoDbId([data.userId, data.bookingId])


    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const payment = await Payment.create([{
            userId,
            bookingId,
            paymentMethod: data.paymentMethod,
            amount: data.amount,
            status: data.payNow ? "PAID" : "PENDING",
        }], { session })
        if (!payment[0]) {
            throw new BadRequestError("Failed to create payment.")
        }

        const booking = await Booking.findByIdAndUpdate(bookingId, {
            status: "CONFIRMED"
        }, { new: true, session })
        if (!booking) {
            throw new NotFoundError("Booking not found.")
        }
        const receipt = await Receipt.create([{
            receiptNo: "REC-" + Date.now(),
            userId,
            paymentId: payment[0]._id,
            bookingId,
            paymentMethod: payment[0].paymentMethod,
            status: payment[0].status,
            amount: payment[0].amount,
            paidAt: payment[0].paidAt,

        }], { session })


        await session.commitTransaction();
        await sendPaymentEmail(booking.email as string, "Payment successful", "Payment successful", payment[0]);

        return payment[0];

    } catch (error) {

        await session.abortTransaction();
        console.warn(error);
        if (error instanceof Error) {
            throw new BadRequestError(error.message)
        }

    } finally {
        await session.endSession()

    }



}

export const ComfirmedPaymnetService = async (
    data: updatePaymentType
) => {
    const [userId, paymentId, bookingId] = checkMongoDbId([data.userId, data.paymentId, data.bookingId]);
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const payment = await Payment.findByIdAndUpdate(paymentId, {
            status: "PAID"
        }, { new: true }).session(session);
        const booking = await Booking.findByIdAndUpdate(bookingId, {
            status: "CONFIRMED"
        }, { new: true }).session(session);
        if (!payment || !booking) {
            throw new NotFoundError("Payment or Booking are not found.")
        }



        await session.commitTransaction();
        return payment
    } catch (error) {
        session.abortTransaction();
        throw error;
    } finally {
        session.endSession()
    }

}

//get all payment
export const getALlPaymentService = async (
    req: Request
) => {
    const {
        page = 1,
        limit = 10,
        sort = 'asc',
        status } = req.validatedQuery as paymentQueryType;


    const skip = Math.ceil((page - 1) * limit);

    const sortDirection: 1 | -1 = sort === "asc" ? 1 : -1;

    const query: any = {};
    if (status) {
        query.status = status
    }
    const [payments, total] = await Promise.all([
        Payment.find(query)
            .sort({ createdAt: sortDirection })
            .skip(skip)
            .limit(limit)
            .populate([
                { path: 'userId', select: "_id name" },

            ])
            .lean()
        ,
        Payment.countDocuments(query)
    ])

    const meta = paginationResponseFormater(page, limit, total);
    return { payments, meta }
}

export const getPaymentById = async (
    id: string
) => {
    const payment = await Payment.findById(id)
        .populate({ path: "userId", select: "_id name " })
        .populate(
            {
                path: "bookingId",
                select: "_id checkIn checkOut hotelId name ",
                populate: ({
                    path: "hotelId",
                    select: "name city"
                })

            }
        ).lean();

    if (!payment) {
        throw new NotFoundError("No payment found.")
    }
    console.log(payment)
    return payment;
}