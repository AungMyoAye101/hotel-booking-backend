import { Router } from "express";
import { checkMongoDBId, validateRequestBody, validateRequestQuery } from "../middleware/validation.middleware";
import { paginationSchmea } from "../validation/pagination";
import { getAllUsersController, getCurrentUserController, getUserByIdController, updateUserController } from "../controller/user.controller";
import { userQuerySchema, userSchmea } from "../validation/userSchmea";

const router: Router = Router();

router.get(
    "/",
    validateRequestQuery(userQuerySchema),
    getAllUsersController
);

router.get(
    "/:userId",
    checkMongoDBId(['userId']),
    getUserByIdController
);
router.put(
    "/:userId",
    checkMongoDBId(['userId']),
    validateRequestBody(userSchmea),
    updateUserController
);


export default router;
