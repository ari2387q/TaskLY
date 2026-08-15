import { Router } from "express";
import * as taskController from "./task.controller";
import { protect } from "../../middlewares/auth.middleware";

const router = Router();

router.use(protect);

router.post("/", taskController.createTask);
router.get("/", taskController.getWorkspaceTasks);
router.get("/skill/:skillId", taskController.getTasks);
router.patch("/:id", taskController.updateTask);

export default router;
