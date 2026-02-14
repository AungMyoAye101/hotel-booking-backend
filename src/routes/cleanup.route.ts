import { Router } from "express";
import { cleanupController } from "../controller/cleanup.controller";

const router: Router = Router();

router.put("/cleanup", cleanupController);

export default router;