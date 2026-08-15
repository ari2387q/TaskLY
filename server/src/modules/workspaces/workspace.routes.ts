import { Router } from "express";
import * as workspaceController from "./workspace.controller";
import { protect } from "../../middlewares/auth.middleware";

const router = Router();

router.use(protect);

router.post("/", workspaceController.createWorkspace);
router.get("/", workspaceController.getWorkspaces);
router.get("/:id", workspaceController.getWorkspaceById);
router.put("/:id", workspaceController.updateWorkspace);
router.post("/:id/members", workspaceController.addMember);
router.delete("/:id/members/:memberId", workspaceController.removeMember);

export default router;
