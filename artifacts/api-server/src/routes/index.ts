import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import reviewsRouter from "./reviews";
import watchlistRouter from "./watchlist";
import searchRouter from "./search";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(reviewsRouter);
router.use(watchlistRouter);
router.use(searchRouter);

export default router;
