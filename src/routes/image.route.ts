import { Router } from "express";
import { checkMongoDBId } from "../middleware/validation.middleware";
import upload from "../config/multer";
import { hotelImageUpdateController, hotelImageUploadController, roomImageUpdateController, roomImageUploadController } from "../controller/image.controller";
import { hasRole } from "../middleware/isAuthenticated";


const router: Router = Router();

router.post(
    '/upload/hotel/:hotelId',
    hasRole(['admin', 'staff']),
    checkMongoDBId(['hotelId']),
    upload.single("image"),
    hotelImageUploadController);

router.put(
    '/update/hotel/:hotelId',
    hasRole(['admin', 'staff']),
    checkMongoDBId(['hotelId']),
    upload.single("image"),
    hotelImageUpdateController);
router.post(
    '/upload/room/:roomId',
    checkMongoDBId(['roomId']),
    upload.single("image"),
    roomImageUploadController);

router.put(
    '/update/hotel/:hotelId',
    hasRole(['admin', 'staff']),
    upload.single("image"),
    checkMongoDBId(['roomId']),
    roomImageUpdateController);


export default router;