import { Router } from "express";
import { postController } from "../controllers";
import { authenticateToken, validate } from "../middleware";
import { createPostSchema, updatePostSchema } from "../schemas";
import { upload } from "../middleware/upload";

const router = Router();

router.post(
  "/",
  authenticateToken,
  upload.array("files", 5),
  validate(createPostSchema),
  postController.create
);

router.get("/:id", authenticateToken, postController.getById);
router.patch("/:id", authenticateToken, upload.array("files", 5), validate(updatePostSchema), postController.update);
router.delete("/:id", authenticateToken, postController.remove);

export default router;
