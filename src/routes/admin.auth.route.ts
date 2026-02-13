import { Router } from "express";
import { validateRequestBody } from "../middleware/validation.middleware";
import { loginSchema, registerSchema } from "../validation/authSchema";
import { adminLoginController, adminLogoutController, adminMeController, adminRegisterController, refrehTokenController } from "../controller/admin.controller";
import { isAuthenticated } from "../middleware/isAuthenticated";


const router: Router = Router();


router.post("/register", validateRequestBody(registerSchema), adminRegisterController);
router.post("/login", validateRequestBody(loginSchema), adminLoginController);
router.post("/logout", isAuthenticated, adminLogoutController);
router.post('/refresh', refrehTokenController)
router.get('/me', isAuthenticated, adminMeController)

export default router;
