import { Router } from "express";
import { getTotalBookingController, getTotalController, getTotalRevenueController } from "../controller/analytic.controller";
import { hasRole } from "../middleware/isAuthenticated";

const router: Router = Router();

router.get(
    '/dashboard/revenue',
    hasRole(['admin', 'staff']),
    getTotalRevenueController
)
router.get(
    '/dashboard/total',
    hasRole(['admin', 'staff']),
    getTotalController
)
router.get(
    '/dashboard/booking',
    hasRole(['admin', 'staff']),
    getTotalBookingController
)

export default router;