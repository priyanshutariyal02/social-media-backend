import { Router } from "express";
import {
  addComment,
  deleteComment,
  getVideoComments,
  updateComment,
  getTweetComments,
  addTweetComment,
  getCommentReplies,
  addCommentReply,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/:videoId").get(getVideoComments).post(verifyJWT, addComment);
router.route("/t/:tweetId").get(getTweetComments).post(verifyJWT, addTweetComment);
router.route("/r/:commentId").get(getCommentReplies).post(verifyJWT, addCommentReply);
router.route("/c/:commentId").delete(verifyJWT, deleteComment).patch(verifyJWT, updateComment);

export default router;
