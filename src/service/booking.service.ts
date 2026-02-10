import { Request } from "express";
import { bookingType, updateBookingType } from "../validation/bookingSchema";
import Booking from "../models/booking.model";
import Room, { IRoom } from "../models/room.model";
import { BadRequestError, NotFoundError } from "../common/errors";
import { checkMongoDbId } from "../utils/checkMongoDbId";
import { paginationResponseFormater } from "../utils/paginationResponse";
import mongoose from "mongoose";

export const createBookingService = async (
    data: bookingType
) => {
    console.log(data, "data")
    const [roomId] = checkMongoDbId([data.roomId]);


    const session = await mongoose.startSession();

    try {
        session.startTransaction();
        const booked = await Booking.aggregate([
            {
                $match: {
                    roomId,
                    status: { $in: ['PENDING', 'CONFRIMED', "STAYED"] },
                    checkIn: { $lt: new Date(data.checkOut) },
                    checkOut: { $gt: new Date(data.checkIn) },
                }
            },
            {
                $group: {
                    _id: null,
                    bookedCount: { $sum: "$quantity" }
                }
            }
        ]).session(session);

        console.log(booked, "booked")
        const bookedCount = booked.length > 0 ? booked[0].bookedCount : 0;
        console.log(bookedCount, "bookedCount")

        const room = await Room.findById(data.roomId).session(session) as IRoom;
        console.log(room, "room")
        if (room.totalRooms - bookedCount < data.quantity) {
            throw new BadRequestError("Not enoungh room .");
        }
        const booking = await Booking.create([data], { session });
        console.log(booking, "booking")

        if (booking.length === 0) {
            throw new BadRequestError("Failed to create booking")
        }
        await session.commitTransaction();

        return booking[0];

    } catch (error) {
        session.abortTransaction();

        throw error;
    } finally {
        session.endSession()
    }


};

export const updateBookingService = async (
    id: string,
    data: updateBookingType
) => {

    const booking = await Booking.findByIdAndUpdate(id, data, { new: true })
    if (!booking) {
        throw new NotFoundError("Booking not found.")
    }
    return booking;
}
export const getAllBookingByRoomIdService = async (
    req: Request

) => {
    const { roomId } = req.validatedParams;

    const { page = 1, limit = 10 } = req.validatedQuery;
    //skip amount 
    const skip = (page - 1) * limit;
    const bookings = await Booking.find({ roomId })
        .sort({ createdAt: -1 }).skip(skip).limit(10).lean()
    if (!bookings) {
        throw new NotFoundError("Booking not found.")
    }
    const total = await Booking.countDocuments({ roomId });

    const meta = paginationResponseFormater(page, limit, total)
    return { bookings, meta };
}

export const getALlBookingsService = async (req: Request) => {
    const { page = 1, limit = 10, status, sort = "desc", checkIn, checkOut } = req.validatedQuery;

    // Ensure numeric pagination values with sane defaults
    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.max(Number(limit) || 10, 1);


    // Build filter query
    const query: Record<string, unknown> = {};

    if (status) {
        query.status = status
    }
    // Search for bookings where checkIn date falls within the specified date range
    if (checkIn && checkOut) {
        // Validate that checkOut is after checkIn (defensive check, though zod also validates)
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        if (checkOutDate <= checkInDate) {
            throw new BadRequestError("Check-out date must be after check-in date.");
        }

        // Find bookings where checkIn is within the search date range
        // This is optimized for index usage on checkIn field
        query.checkIn = {
            $gte: checkInDate,
            $lte: checkOutDate
        };
    } else if (checkIn) {
        // If only checkIn is provided, find bookings from that date onwards
        query.checkIn = { $gte: new Date(checkIn) };
    } else if (checkOut) {
        // If only checkOut is provided, find bookings up to that date
        query.checkIn = { $lte: new Date(checkOut) };
    }
    // Normalize sort direction (default: newest first)
    const sortDirection: 1 | -1 = sort === "asc" ? 1 : -1;
    const skip = (pageNumber - 1) * limitNumber;

    // Run query and count in parallel for better performance
    const [bookings, total] = await Promise.all([
        Booking.find(query)
            .sort({ createdAt: sortDirection })
            .skip(skip)
            .limit(limitNumber)
            .populate([
                { path: "userId", select: "_id name" },
                { path: "roomId", select: "_id name" },
                // { path: "hotelId", select: "_id name" },
            ])
            .lean(),
        Booking.countDocuments(query),
    ]);

    const meta = paginationResponseFormater(pageNumber, limitNumber, total);
    console.log(meta)

    return { bookings, meta };
}

export const getBookingById = async (id: string) => {

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestError("Invalid booking id")
    }

    const booking = await Booking.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(id)
            }
        },
        // user
        {
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: '_id',
                as: "user"

            }
        },
        {
            $unwind: "$user"
        },
        // hotel 
        {
            $lookup: {
                from: "hotels",
                localField: "hotelId",
                foreignField: '_id',
                as: "hotel"

            }
        },
        {
            $unwind: "$hotel"
        },
        //room
        {
            $lookup: {
                from: "rooms",
                localField: "roomId",
                foreignField: '_id',
                as: "room"

            }
        },
        {
            $unwind: "$room"
        },
        {
            $lookup: {
                from: "images",
                localField: "hotel.photo",
                foreignField: '_id',
                as: "photo"

            }
        },
        {
            $unwind: {
                path: '$photo',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                _id: 1,
                checkIn: 1,
                checkOut: 1,
                quantity: 1,
                guest: 1,
                totalPrice: 1,
                status: 1,
                name: 1,
                email: 1,
                phone: 1,
                city: 1,
                country: 1,

                hotel: {
                    name: "$hotel.name",
                    adddress: "$hotel.address",
                    city: "$hotel.city",
                    rating: "$hotel.rating",
                    star: "$hotel.star",
                    photo: "$photo.secure_url"
                },
                room: {
                    name: "$room.name",
                    price: "$room.price",
                    bedType: "$room.bedTypes"
                },
                user: {
                    _id: '$user._id',
                    name: "$user.name",

                }


            }
        }


    ]);

    if (booking && booking.length === 0) {
        throw new NotFoundError("Booking not found")
    }

    return booking[0];
}
