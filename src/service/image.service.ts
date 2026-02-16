import { v2 as cloudinary } from "cloudinary";
import { Request } from "express"
import Hotel from "../models/hotel.model";
import fs from "fs/promises";
import Room from "../models/room.model";
import mongoose from "mongoose";
import { BadRequestError, NotFoundError, ValidationError } from "../common/errors";
import Image from "../models/image.model";

export const uploadHotelImgService = async (
    req: Request
) => {
    if (!req.file) {
        throw new ValidationError([{
            message: "Image is required.",
            path: "image"
        }]);
    }
    const file = req.file;
    console.log(file)
    const { hotelId } = req.validatedParams
    //upload img to cloudinary 
    let uploaded;

    const session = await mongoose.startSession();
    try {
        uploaded = await cloudinary.uploader.upload(
            file.path,
            {
                folder: "Booking",
                resource_type: "image"
            });
        console.log("uploading...")
        if (!uploaded) {
            throw new BadRequestError("Failed to upload image to cloudinary.")
        }

        //start mogoose transticaton
        session.startTransaction();

        const hotel = await Hotel.findById(hotelId).session(session);
        if (!hotel) {
            throw new NotFoundError("Hotel was not found.");
        }
        const image = await Image.create([{
            secure_url: uploaded.secure_url,
            public_id: uploaded.public_id,
        }], { session });
        console.log("uploaded")

        hotel.photo = image[0]._id as mongoose.Types.ObjectId;

        await hotel.save({ session });
        await session.commitTransaction();
        return hotel;
    } catch (error) {
        await session.abortTransaction();
        if (uploaded?.public_id) {
            await cloudinary.uploader.destroy(uploaded.public_id).catch(() => { });
        }
        throw error;
    } finally {
        await session.endSession();
        await fs.unlink(file.path);
    }
}




//remove image from hotel

export const updateHotelImgService = async (
    req: Request
) => {
    if (!req.file) {
        throw new ValidationError([{
            message: "Image is required.",
            path: "image"
        }]);
    };
    const file = req.file;
    const { hotelId } = req.validatedParams
    if (!hotelId) {
        throw new BadRequestError("Hotel Id is required.")
    }
    let uploaded;
    const session = await mongoose.startSession()
    try {
        uploaded = await cloudinary.uploader.upload(file.path, {
            folder: "Booking",
            resource_type: "image"
        })

        if (!uploaded) {
            throw new BadRequestError("Failed to upload image to cloudinary.")
        };

        session.startTransaction();
        const hotel = await Hotel.findById(hotelId).session(session);

        if (!hotel || !hotel.photo) {
            throw new NotFoundError("Hotel or photo was not found.")
        }
        const image = await Image.findById(hotel.photo).session(session);
        if (!image) {
            throw new NotFoundError("Image was not found.")
        }
        const oldPhotoId = image.public_id;
        image.secure_url = uploaded.secure_url;
        image.public_id = uploaded.public_id;
        await image.save({ session });

        await cloudinary.uploader.destroy(oldPhotoId)
        await session.commitTransaction()
        return hotel;
    } catch (error) {
        await session.abortTransaction()
        if (uploaded?.public_id) {
            await cloudinary.uploader.destroy(uploaded.public_id)
        }
        throw error;
    } finally {
        await session.endSession();
        await fs.unlink(file.path)
    }
}

export const uploadRoomImgService = async (
    req: Request
) => {
    if (!req.file) {
        throw new ValidationError([{
            message: "Image is required.",
            path: "image"
        }]);
    }
    const file = req.file;
    const { roomId } = req.validatedParams;
    //upload img to cloudinary 
    if (!roomId) {
        throw new BadRequestError("Room id is required.")
    }

    let uploaded;
    const session = await mongoose.startSession()
    try {
        uploaded = await cloudinary.uploader.upload(
            file.path,
            {
                folder: "Booking",
                resource_type: "image"
            });

        if (!uploaded) {
            throw new BadRequestError("Failed to upload image to cloudinary.")
        }

        //session start
        session.startTransaction();
        const room = await Room.findById(roomId).session(session);
        if (!room) {
            throw new NotFoundError("Room not found.");
        }
        const image = await Image.create([{
            secure_url: uploaded.secure_url,
            public_id: uploaded.public_id
        }], { session });

        room.photo = image[0]._id as mongoose.Types.ObjectId;

        await room.save({ session })

        await session.commitTransaction()
        return room;

    } catch (error) {
        await session.abortTransaction();
        if (uploaded?.public_id) {
            await cloudinary.uploader.destroy(uploaded.public_id)
            throw error;
        }
    } finally {
        await session.endSession();
        fs.unlink(file.path)
    }

};


export const updateRoomImgService = async (
    req: Request
) => {
    if (!req.file) {
        throw new ValidationError([{
            message: "Image is required.",
            path: "image"
        }]);
    };
    const file = req.file;
    const { roomId } = req.validatedParams
    if (!roomId) {
        throw new BadRequestError("Room id is required.")
    }

    let uploaded;
    const session = await mongoose.startSession();

    try {
        uploaded = await cloudinary.uploader.upload(file.path, {
            folder: "Booking",
            resource_type: "image"
        })
        if (!uploaded) {
            throw new BadRequestError("Failed to upload image to cloudinary.")
        }

        session.startTransaction()
        const room = await Room.findById(roomId).session(session)
        if (!room || !room.photo) {
            throw new NotFoundError("Room not found.")
        }
        const image = await Image.findById(room.photo).session(session);
        if (!image) {
            throw new NotFoundError("Image not found.")
        }
        const oldPhotoId = image?.public_id;
        image.secure_url = uploaded.secure_url;
        image.public_id = uploaded.public_id;

        await image.save({ session });
        await cloudinary.uploader.destroy(oldPhotoId);
        await session.commitTransaction();
        return room;

    } catch (error) {
        await session.abortTransaction();
        if (uploaded?.public_id) {
            await cloudinary.uploader.destroy(uploaded?.public_id)
        }
        throw error;
    } finally {
        await session.endSession();
        await fs.unlink(file.path)
    }
}