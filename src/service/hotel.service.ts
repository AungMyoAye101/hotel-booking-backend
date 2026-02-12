
import { NotFoundError } from "../common/errors";
import Hotel from "../models/hotel.model";
import { paginationResponseFormater } from "../utils/paginationResponse";
import { hotelType, hotelUpdateType } from "../validation/hotelSchema";
import { Request } from "express";
import { hotelQueryType } from "../validation/searchSchema";

export const createHotelService = async (
    data: hotelType,
) => {
    return await Hotel.create(data);
}
//update hotel
export const updateHotelService = async (
    id: string,
    data: hotelUpdateType
) => {

    const hotel = await Hotel.findOneAndUpdate({ _id: id }, data, { new: true })
    if (!hotel) {
        throw new NotFoundError("Hotel not found.")
    }

    return hotel;
}

export const deleteHotelService = async (id: string) => {
    return await Hotel.findByIdAndDelete(id);
}
//get hotel by id
export const getHotelByIdService = async (id: string) => {

    const hotel = await Hotel.findById(id).populate("photo").lean();
    if (!hotel) {
        throw new NotFoundError("Hotel not found.")
    }

    return hotel;
}

//get all hotels
export const getAllHotelsService = async (
    req: Request
) => {
    const {
        destination,
        minPrice = 100,
        maxPrice = 10000,
        type,
        stars,
        priceOrder,
        ratingOrder,
        page = 1,
        limit = 10,
    } = req.validatedQuery as hotelQueryType;



    const skip = (page - 1) * limit;


    const filter: Record<string, any> = {
        price: {
            $gte: minPrice,
            $lte: maxPrice
        }
    }

    if (destination) {
        // Match destination against either city OR country (case-insensitive)
        filter.$or = [
            { city: { $regex: destination, $options: "i" } },
            { country: { $regex: destination, $options: "i" } },
        ];


    }

    //filter by type 
    if (type) {
        filter.type = type;
    }

    // Use array format for explicit sort order control
    const sortArray: [string, 1 | -1][] = []

    // Check if ratingOrder was explicitly provided in the query (not just default)
    const ratingOrderExplicit = req.query.ratingOrder !== undefined;
    const priceOrderExplicit = req.query.priceOrder !== undefined;


    if (ratingOrderExplicit) {

        sortArray.push(['rating', ratingOrder === "asc" ? 1 : -1]);

        if (priceOrderExplicit) {
            sortArray.push(['price', priceOrder === "asc" ? 1 : -1]);
        }
    } else if (priceOrderExplicit) {

        sortArray.push(['price', priceOrder === "asc" ? 1 : -1]);
    } else {
        // Both use defaults: sort by rating (desc) first, then price (asc)
        sortArray.push(['rating', ratingOrder === "asc" ? 1 : -1]);
        sortArray.push(['price', priceOrder === "asc" ? 1 : -1]);
    }

    if (stars && stars.length) {
        filter.star = { $in: stars }
    }

    const [hotels, total] = await Promise.all([
        Hotel.find(
            filter
        ).sort(sortArray.length > 0 ? sortArray : {})
            .skip(skip)
            .limit(limit)
            .populate({
                path: "photo",
                select: 'secure_url'
            })
            .lean(),
        await Hotel.countDocuments(filter)
    ])

    const meta = paginationResponseFormater(page, limit, total)


    if (!hotels) {
        throw new NotFoundError("Hotels are not found.")
    }


    return { hotels, meta };
}

export const getHotelByTypesService = async () => {

    const deafult_types = ["hotel", "motel", "guest_house"];
    const result = await Hotel.aggregate([
        {
            $group: {
                _id: "$type",
                count: { $sum: 1 }
            }
        },
        {
            $lookup: {
                from: "image",
                localField: "photoId",
                foreignField: "_id",
                as: "photo"
            }
        },
        {
            $unwind: {
                path: "photo",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                _id: 0,
                type: "$_id",
                count: 1
            }
        }
    ]);

    if (!result) {
        throw new NotFoundError("Hotel types are not found.")
    }

    const map = Object.fromEntries(result.map(v => [v.type, v.count]));

    return deafult_types.map(type => ({
        type,
        count: map[type] || 0
    }
    ));
}