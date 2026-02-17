import dotenv from "dotenv";
import path from "path";
import fs from "fs/promises";
import { v2 as cloudinary } from "cloudinary";
import { faker } from "@faker-js/faker";
import { connectToDb } from "../utils/connectToDb";
import User from "../models/user.model";
import { hashPassword } from "../common/password";
import Admin from "../models/admin.model";
import Hotel from "../models/hotel.model";
import Room from "../models/room.model";
import Booking from "../models/booking.model";
import Payment from "../models/payment.model";
import Review from "../models/review.model";
import Receipt from "../models/receipt.model";
import Image from "../models/image.model";

dotenv.config();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const IMAGES_BASE = path.join(__dirname, "images");

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

/** Get sorted list of local image file paths from a directory (e.g. hotels or rooms). */
const getLocalImagePaths = async (subdir: "hotels" | "rooms"): Promise<string[]> => {
    const dir = path.join(IMAGES_BASE, subdir);
    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        const files = entries
            .filter((e) => e.isFile() && IMAGE_EXTENSIONS.includes(path.extname(e.name).toLowerCase()))
            .map((e) => path.join(dir, e.name))
            .sort();
        return files;
    } catch (err) {
        return [];
    }
};


/** Upload a local image file to Cloudinary and return secure_url + public_id */
const uploadLocalImageToCloudinary = async (
    filePath: string,
    folder = "Booking"
): Promise<{ secure_url: string; public_id: string }> => {
    const result = await cloudinary.uploader.upload(filePath, {
        folder,
        resource_type: "image",
    });
    if (!result?.secure_url || !result?.public_id) {
        throw new Error(`Cloudinary upload failed for ${filePath}`);
    }
    return { secure_url: result.secure_url, public_id: result.public_id };
};

const seed = async () => {
    await connectToDb();

    const users = await seedUser();
    await seedAdmin();
    const hotels = await seedHotel();
    const rooms = await seedRoom(hotels);
    const bookings = await seedBooking(users, rooms);
    const payments = await seedPayment(bookings);
    await seedReceipt(payments);
    await seedReview(users, hotels);

    console.log("All seeds completed successfully.");
    process.exit(0);
};

// const seedImage = async () => {
//     await Image.deleteMany();
//     console.log("Deleting images...");
//     const count = 30;
//     const images = Array.from({ length: count }, (_, i) => ({
//         secure_url: `https://picsum.photos/seed/hotel-${i}/400/300`,
//         public_id: `seed/hotel-${i}-${faker.string.alphanumeric(8)}`,
//     }));
//     const inserted = await Image.insertMany(images);
//     console.log("Images seeded successfully");
//     return inserted;
// };

const seedUser = async () => {
    await User.deleteMany();
    console.log("Deleting users...");
    const password = await hashPassword("user123");
    const users = Array.from({ length: 20 }, () => ({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password,
        city: faker.location.city(),
        country: faker.location.country(),
        phone: faker.phone.number(),
    }));
    const inserted = await User.insertMany(users);
    console.log("Users seeded successfully");
    return inserted;
};

const seedAdmin = async () => {
    await Admin.deleteMany();
    console.log("Deleting admins...");
    const passwordAdmin = await hashPassword("admin123");
    const admins = [
        { name: "Admin", email: "admin@gmail.com", password: passwordAdmin, role: "admin" as const },
        { name: "Staff", email: "staff@gmail.com", password: passwordAdmin, role: "staff" as const },
    ];
    await Admin.insertMany(admins);
    console.log("Admins seeded successfully");
};
const LocalHotel = [
    {
        "name": "The Strand Yangon",
        "description": "A historic luxury hotel featuring Victorian architecture and high-end service.",
        "rating": 8,
        "star": 5,
        "type": "hotel",
        "address": "92 Strand Rd, Yangon",
        "price": 250,
        "amenities": ["wifi", "parking", "pool", "gym", "breakfast", "ac"],
        "city": "yangon",
        "country": "Myanmar"
    },
    {
        "name": "Mandalay Hill View Motel",
        "description": "Affordable and cozy stay near the foot of Mandalay Hill.",
        "rating": 4,
        "star": 3,
        "type": "motel",
        "address": "10th Street, Mandalay",
        "price": 45,
        "amenities": ["wifi", "parking", "pool", "gym", "breakfast", "ac"],
        "city": "mandalay",
        "country": "Myanmar"
    },
    {
        "name": "Bagan Heritage Guest House",
        "description": "Traditional boutique lodging located right in the heart of the Archaeological Zone.",

        "rating": 4,
        "star": 4,
        "type": "guest-house",
        "address": "Nyaung-U, Bagan",
        "price": 60,
        "amenities": ["wifi", "parking", "pool", "gym", "breakfast", "ac"],
        "city": "bagan",
        "country": "Myanmar"
    },
    {
        "name": "Skyline Bangkok Hotel",
        "description": "Modern skyscraper hotel with a rooftop infinity pool overlooking Sukhumvit.",

        "rating": 4,
        "star": 5,
        "type": "hotel",
        "address": "Sukhumvit Soi 11, Bangkok",
        "price": 180,
        "amenities": ["wifi", "parking", "pool", "gym", "breakfast", "ac"],
        "city": "bangkok",
        "country": "Thailand"
    },
    {
        "name": "Inya Lake Retreat",
        "description": "Peaceful guest house with stunning views of Inya Lake.",

        "rating": 4,
        "star": 3,
        "type": "guest-house",
        "address": "Kaba Aye Pagoda Road, Yangon",
        "price": 35,
        "amenities": ["wifi", "parking", "pool", "gym", "breakfast", "ac"],
        "city": "yangon",
        "country": "Myanmar"
    },
    {
        "name": "Royal Palace Hotel",
        "description": "Upscale accommodation with views of the Mandalay Royal Palace.",

        "rating": 4,
        "star": 4,
        "type": "hotel",
        "address": "26th Street, Mandalay",
        "price": 110,
        "amenities": ["wifi", "parking", "pool", "gym", "breakfast", "ac"],
        "city": "mandalay",
        "country": "Myanmar"
    },
    {
        "name": "Sunset View Motel",
        "description": "Simple and clean motel perfect for travelers on a budget.",

        "rating": 4,
        "star": 2,
        "type": "motel",
        "address": "Main Road, New Bagan",
        "price": 25,
        "amenities": ["wifi", "parking", "pool", "gym", "breakfast", "ac"],
        "city": "bagan",
        "country": "Myanmar"
    },
    {
        "name": "Chao Phraya Riverside Hotel",
        "description": "Elegant stay on the banks of the River of Kings.",

        "rating": 4,
        "star": 5,
        "type": "hotel",
        "address": "Charoen Krung Rd, Bangkok",
        "price": 320,
        "amenities": ["wifi", "parking", "pool", "gym", "breakfast", "ac"],
        "city": "bangkok",
        "country": "Thailand"
    },
    {
        "name": "The Golden Guest House",
        "description": "Centrally located near the Shwedagon Pagoda.",

        "rating": 4,
        "star": 3,
        "type": "guest-house",
        "address": "Bahan Township, Yangon",
        "price": 40,
        "amenities": ["wifi", "parking", "pool", "gym", "breakfast", "ac"],
        "city": "yangon",
        "country": "Myanmar"
    },
    {
        "name": "Old City Boutique Motel",
        "description": "Stylish, minimalist motel in the heart of Bangkok's Old City.",

        "rating": 4,
        "star": 4,
        "type": "motel",
        "address": "Khao San Area, Bangkok",
        "price": 75,
        "amenities": ["wifi", "parking", "pool", "gym", "breakfast", "ac"],
        "city": "bangkok",
        "country": "Thailand"
    }
]

const seedHotel = async () => {
    await Hotel.deleteMany();
    await Image.deleteMany();
    console.log("Deleting hotels and images...");
    const hotelTypes = ["hotel", "motel", "guest-house"] as const;
    const allAmenities = ["wifi", "parking", "pool", "gym", "breakfast", "ac"];
    const fakeHotel = Array.from({ length: 10 }, (_, i) => ({
        name: faker.company.name(),
        description: faker.company.catchPhrase(),
        address: faker.location.streetAddress(),
        price: faker.number.int({ min: 80, max: 999 }),
        city: faker.location.city(),
        country: faker.location.country(),
        rating: faker.number.int({ min: 1, max: 10 }),
        star: faker.number.int({ min: 1, max: 5 }),
        type: faker.helpers.arrayElement(hotelTypes),
    }));
    const hotels = [...LocalHotel, ...fakeHotel];

    const inserted = await Hotel.insertMany(hotels);
    const hotelImagePaths = await getLocalImagePaths("hotels");
    if (hotelImagePaths.length === 0) {
        throw new Error(
            `No local images found. Add image files (.jpg, .png, .webp, .gif) to: ${path.join(IMAGES_BASE, "hotels")}`
        );
    }
    console.log("Uploading hotel images from local files to Cloudinary...");
    for (let i = 0; i < inserted.length; i++) {
        const hotel = inserted[i];
        const imagePath = hotelImagePaths[i % hotelImagePaths.length];
        const { secure_url, public_id } = await uploadLocalImageToCloudinary(imagePath);
        const [imageDoc] = await Image.create([{ secure_url, public_id }]);
        hotel.photo = imageDoc._id;
        await hotel.save();
    }
    console.log("Hotels seeded successfully with images");
    return inserted;
};

const seedRoom = async (
    hotels: { _id: unknown }[],
) => {
    await Room.deleteMany();
    console.log("Deleting rooms...");
    const bedTypes = ["king", "queen", "full", "twin", "single"] as const;
    const rooms = Array.from({ length: 40 }, () => ({
        name: faker.helpers.arrayElement(["Deluxe", "Standard", "Suite", "Family", "Executive"]) + " Room",
        maxPeople: faker.number.int({ min: 1, max: 6 }),
        price: faker.number.int({ min: 50, max: 400 }),
        totalRooms: faker.number.int({ min: 1, max: 10 }),
        bedTypes: faker.helpers.arrayElement(bedTypes),
        hotelId: faker.helpers.arrayElement(hotels)._id,
    }));
    const inserted = await Room.insertMany(rooms);
    const roomImagePaths = await getLocalImagePaths("rooms");
    if (roomImagePaths.length === 0) {
        throw new Error(
            `No local images found. Add image files (.jpg, .png, .webp, .gif) to: ${path.join(IMAGES_BASE, "rooms")}`
        );
    }
    console.log("Uploading room images from local files to Cloudinary...");
    for (let i = 0; i < inserted.length; i++) {
        const room = inserted[i];
        const imagePath = roomImagePaths[i % roomImagePaths.length];
        const { secure_url, public_id } = await uploadLocalImageToCloudinary(imagePath);
        const [imageDoc] = await Image.create([{ secure_url, public_id }]);
        room.photo = imageDoc._id;
        await room.save();
    }
    console.log("Rooms seeded successfully with images");
    return inserted;
};

const seedBooking = async (
    users: { _id: unknown; name?: string; email?: string; city?: string; country?: string; phone?: string }[],
    rooms: { _id: unknown; hotelId: unknown; price: number, maxPeople: number }[]
) => {
    await Booking.deleteMany();
    console.log("Deleting bookings...");

    if (users.length === 0 || rooms.length === 0) {
        console.log("Users and rooms must be seeded first.");
        return [];
    }

    const statuses = ["CONFIRMED", "CONFIRMED", "CONFIRMED", "PENDING", "STAYED", "CANCELLED", "EXPIRED"] as const;
    const bookings = Array.from({ length: 35 }, () => {
        const selectedRoom = faker.helpers.arrayElement(rooms);
        const user = faker.helpers.arrayElement(users);
        const quantity = faker.number.int({ min: 1, max: 3 });
        const guest = faker.number.int({ min: 1, max: selectedRoom.maxPeople ?? 4 });
        const checkIn = faker.date.future({ years: 0.08 });
        checkIn.setHours(14, 0, 0, 0);
        const nights = faker.number.int({ min: 1, max: 7 });
        const checkOut = new Date(checkIn);
        checkOut.setDate(checkOut.getDate() + nights);
        checkOut.setHours(11, 0, 0, 0);
        const totalPrice = selectedRoom.price * quantity * nights;
        const status = faker.helpers.arrayElement(statuses);

        return {
            userId: user._id,
            roomId: selectedRoom._id,
            hotelId: selectedRoom.hotelId,
            name: user.name ?? faker.person.fullName(),
            email: user.email ?? faker.internet.email(),
            city: user.city ?? faker.location.city(),
            country: user.country ?? faker.location.country(),
            phone: user.phone ?? faker.phone.number(),
            checkIn,
            checkOut,
            quantity,
            guest,
            totalPrice,
            status,
        };
    });

    const inserted = await Booking.insertMany(bookings);
    console.log("Bookings seeded successfully");
    return inserted;
};

const seedPayment = async (
    bookings: { _id: unknown; userId: unknown; totalPrice: number }[]
) => {
    await Payment.deleteMany();
    console.log("Deleting payments...");

    if (bookings.length === 0) {
        console.log("Bookings must be seeded first.");
        return [];
    }

    const paymentMethods = ["MOBILE_BANKING", "CARD", "BANK"] as const;
    const statuses = ["PAID", "PAID", "PAID", "PENDING", "FAILED", "REFUNDED"] as const;

    const payments = bookings.map((booking) => {
        const status = faker.helpers.arrayElement(statuses);
        let paidAt = new Date();
        if (status === "PAID" && faker.datatype.boolean(0.8)) {
            paidAt = faker.date.past({ years: 0.2 });
        } else if (status === "PAID") {
            paidAt = faker.date.recent({ days: 14 });
        }

        return {
            bookingId: booking._id,
            userId: booking.userId,
            paymentMethod: faker.helpers.arrayElement(paymentMethods),
            status,
            amount: booking.totalPrice,
            paidAt,
        };
    });

    const inserted = await Payment.insertMany(payments);
    console.log("Payments seeded successfully");
    return inserted;
};

const seedReceipt = async (
    payments: { _id: unknown; userId: unknown; bookingId: unknown; paymentMethod: string; status: string; amount: number; paidAt: Date }[]
) => {
    await Receipt.deleteMany();
    console.log("Deleting receipts...");

    if (payments.length === 0) {
        console.log("Payments must be seeded first.");
        return;
    }

    const receipts = payments.map((payment, index) => ({
        receiptNo: `RCP-${Date.now().toString(36).toUpperCase()}-${String(index + 1).padStart(4, "0")}`,
        userId: payment.userId,
        paymentId: payment._id,
        bookingId: payment.bookingId,
        paymentMethod: payment.paymentMethod as "MOBILE_BANKING" | "CARD" | "BANK",
        status: (payment.status === "REFUNDED" ? "PAID" : payment.status) as "PAID" | "PENDING" | "FAILED",
        amount: payment.amount,
        paidAt: payment.paidAt,
    }));

    await Receipt.insertMany(receipts);
    console.log("Receipts seeded successfully");
};

const seedReview = async (
    users: { _id: unknown }[],
    hotels: { _id: unknown }[]
) => {
    await Review.deleteMany();
    console.log("Deleting reviews...");

    if (users.length === 0 || hotels.length === 0) {
        console.log("Users and hotels must be seeded first.");
        return;
    }

    const reviews = Array.from({ length: 50 }, () => ({
        userId: faker.helpers.arrayElement(users)._id,
        hotelId: faker.helpers.arrayElement(hotels)._id,
        review: faker.lorem.paragraph(),
        rating: faker.number.int({ min: 1, max: 9 }),
    }));

    await Review.insertMany(reviews);
    console.log("Reviews seeded successfully");
};

seed().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});
