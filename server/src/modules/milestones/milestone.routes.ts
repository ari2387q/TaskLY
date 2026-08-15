import { Router } from "express";
import * as milestoneController from "./milestone.controller";
import { protect } from "../../middlewares/auth.middleware";

const router = Router();

router.use(protect);

router.post("/", milestoneController.createMilestone);
router.get("/skill/:skillId", milestoneController.getMilestones);
router.patch("/:id/toggle", milestoneController.toggleMilestone);

export default router;
