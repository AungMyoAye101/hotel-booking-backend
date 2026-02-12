import { Router } from "express";
import { checkMongoDBId, validateRequestBody, validateRequestQuery } from "../middleware/validation.middleware";
import { paginationSchmea } from "../validation/pagination";
import { createReviewController, getReviewByHotelIDController, updateReviewController } from "../controller/review.controller";
import { isAuthenticated } from "../middleware/isAuthenticated";
import { createReviewSchema, updateReviewSchema } from "../validation/reviewSchema";

const router: Router = Router();

router.get(
    "/:hotelId",
    checkMongoDBId(['hotelId']),
    validateRequestQuery(paginationSchmea),
    getReviewByHotelIDController
);
router.post(
    "/create",
    isAuthenticated,
    validateRequestBody(createReviewSchema),
    createReviewController
)
router.put(
    "/update/:id",
    isAuthenticated,
    checkMongoDBId(['id']),
    validateRequestBody(updateReviewSchema),
    updateReviewController
)

export default router;