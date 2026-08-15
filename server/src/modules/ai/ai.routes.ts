import { Router } from "express";
import { aiChat, aiHistory, aiMotivation } from "./ai.controller";
import { protect } from "../../middlewares/auth.middleware";

const router = Router();
router.post("/", protect, aiChat);
router.get("/history", protect, aiHistory);
router.get("/motivation", protect, aiMotivation);
export default router;
