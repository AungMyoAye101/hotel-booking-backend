import mongoose from "mongoose";
import { BadRequestError, NotFoundError } from "../common/errors";
import Hotel from "../models/hotel.model"
import Room from "../models/room.model";
import { paginationResponseFormater } from "../utils/paginationResponse";
import { avaliableRoomQueryType, createRoomType } from "../validation/roomSchema";
import { Request } from "express";
import Booking from "../models/booking.model";
import { availableMemory } from "process";

export const createRoomService = async (
    hotelId: string,
    data: createRoomType
) => {

    return await Room.create({ ...data, hotelId });

};

export const updateRoomService = async (
    req: Request
) => {
    const { roomId } = req.validatedParams;
    const data = req.validatedBody;
    console.log(data)
    const room = await Room.findByIdAndUpdate(roomId, data, { new: true })
    if (!room) {
        throw new NotFoundError("Room not found.");
    }
    console.log(room);
    return room;
}
export const deleteRoomService = async (
    req: Request
) => {

    const { roomId } = req.validatedParams;

    const session = await mongoose.startSession();
    session.startTransaction()

    try {
        const room = await Room.findByIdAndDelete(roomId);
        if (!room) {
            throw new NotFoundError("Room not found.")
        }
        await Booking.deleteMany({ roomId })

        session.commitTransaction();

        return room;

    } catch (error) {
        session.abortTransaction();
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(errorMessage);
    } finally {
        session.endSession()
    }
}

export const getRoomByIdService = async (id: string) => {

    const room = await Room.findById(id)
        .populate({
            path: "hotelId",
            select: "name address city country photo",
            populate: ({
                path: "photo",
                select: "secure_url"
            })
        }
        ).lean();
    if (!room) {
        throw new NotFoundError("Room not found.")
    }

    return room;
}

export const getRoomsByHotelIdService = async (
    req: Request
) => {
    const hotelId = req.validatedParams.hotelId;
    const { checkIn, checkOut, guest = 1 } = req.validatedQuery as avaliableRoomQueryType;




    const start = checkIn ? new Date(checkIn) : null;
    const end = checkOut ? new Date(checkOut) : null;

    const pipeline: any[] = [
        {
            $match: {
                hotelId: new mongoose.Types.ObjectId(String(hotelId)),
                maxPeople: { $gte: Number(guest) }

            }
        }
    ]

    // ----------------check room avaliable ---------

    if (start && end) {
        pipeline.push(
            {
                $lookup: {
                    from: "bookings",
                    let: { roomId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: ['$roomId', "$$roomId"]
                                        },
                                        {
                                            $in: ["$status", ["CONFIRMED", "STAYED"]]
                                        },
                                        {
                                            $lt: ["$checkIn", end]
                                        },
                                        {
                                            $gt: ['$checkOut', start]
                                        }
                                    ]
                                }
                            }
                        },
                        {
                            $project: { quantity: 1 }
                        }
                    ], as: "overlappingBookings"
                }
            },
            {
                $addFields: {
                    bookedCount: { $ifNull: [{ $sum: "$overlappingBookings.quantity" }, 0] }
                }
            },
            {
                $addFields: {
                    avaliableRooms: {
                        $subtract: ['$totalRooms', '$bookedCount']
                    }
                }
            },
            {
                $match: {
                    avaliableRooms: { $gt: 0 }
                }
            },
            {
                $lookup: {
                    from: "images",
                    localField: "photo",
                    foreignField: "_id",
                    as: "photo"

                }
            },
            {
                $unwind: "$photo"
            }


        )
    }

    const rooms = await Room.aggregate(pipeline)


    if (!rooms || rooms.length === 0) {
        throw new NotFoundError("Rooms not found.")
    }

    // const total = await Room.countDocuments(query);
    // const meta = paginationResponseFormater(page, limit, total);

    return rooms
}

export const getAllRoomsService = async (req: Request) => {
    const { page = 1, limit = 10, search, sort = "desc" } = req.validatedQuery;
    const query: any = {};
    if (search) {
        query.name = { $regex: search, $options: "i" }
    }
    const skip = (page - 1) * limit;
    const rooms = await Room.find(query)
        .sort({ createdAt: sort === "asc" ? 1 : -1 })
        .skip(skip).limit(limit)
        .populate([
            { path: "hotelId", select: "name" },
            { path: "photo", select: "secure_url" }
        ])
        .lean();
    if (!rooms) {
        throw new NotFoundError("Rooms not found.")
    }
    const total = await Room.countDocuments(query);
    const meta = paginationResponseFormater(page, limit, total);

    return { rooms, meta };
}