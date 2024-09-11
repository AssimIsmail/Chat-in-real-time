import { Router } from "express";
import userRouter from "./userRouter.mjs";
import messageRouter from "./message.mjs";
import friendRequestRouter from "./friendRequest.mjs";
import contactRouter from "./contactRouter.mjs";
import conversationRouter from "./conversation.mjs";
import authRouter from "./authRouter.mjs";
import groupRouter from './group.mjs'
const router = Router();

router.use("/api", userRouter);
router.use("/api", messageRouter);
router.use("/api", friendRequestRouter);
router.use("/api", contactRouter);
router.use("/api", conversationRouter);
router.use("/api", groupRouter);
router.use("/auth", authRouter);

export default router;
