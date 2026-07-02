import { Router } from 'express';
import {
    createTweet,
    deleteTweet,
    getUserTweets,
    updateTweet,
} from "../controllers/tweet.controller.js"
import {verifyJWT, optionalVerifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();
router.route("/").post(verifyJWT, createTweet).get(optionalVerifyJWT, (req, res, next) => {
    req.params.userId = "all";
    return getUserTweets(req, res, next);
});
router.route("/user/:userId").get(optionalVerifyJWT, getUserTweets);
router.route("/:tweetId").patch(verifyJWT, updateTweet).delete(verifyJWT, deleteTweet);

export default router