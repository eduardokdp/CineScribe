import { Router } from "express";
import { db, reviewsTable, usersTable } from "@workspace/db";
import { eq, desc, sql, inArray } from "drizzle-orm";
import {
  CreateReviewBody,
  ListReviewsQueryParams,
  GetReviewParams,
  DeleteReviewParams,
  GetUserReviewsParams,
  GetRecentReviewsQueryParams,
} from "@workspace/api-zod";
import { requireAuth, type AuthRequest } from "../lib/auth";

const router = Router();

function withUsername(reviews: (typeof reviewsTable.$inferSelect)[], userMap: Map<number, string>) {
  return reviews.map((r) => ({
    ...r,
    username: userMap.get(r.userId) ?? null,
  }));
}

async function buildUserMap(userIds: number[]): Promise<Map<number, string>> {
  if (userIds.length === 0) return new Map();
  const unique = [...new Set(userIds)];
  const users = await db.select({ id: usersTable.id, username: usersTable.username })
    .from(usersTable)
    .where(inArray(usersTable.id, unique));
  return new Map(users.map((u) => [u.id, u.username]));
}

router.get("/reviews/recent", async (req, res): Promise<void> => {
  const params = GetRecentReviewsQueryParams.safeParse(req.query);
  const limit = params.success ? (params.data.limit ?? 6) : 6;

  const reviews = await db.select().from(reviewsTable).orderBy(desc(reviewsTable.createdAt)).limit(limit);
  const userMap = await buildUserMap(reviews.map((r) => r.userId));
  res.json(withUsername(reviews, userMap));
});

router.get("/reviews/stats", async (_req, res): Promise<void> => {
  const [[totals], topRatedRaw] = await Promise.all([
    db.select({
      totalReviews: sql<number>`count(*)::int`,
      totalMovieReviews: sql<number>`count(*) filter (where media_type = 'movie')::int`,
      totalBookReviews: sql<number>`count(*) filter (where media_type = 'book')::int`,
      averageRating: sql<number>`coalesce(avg(rating)::numeric(3,2), 0)`,
    }).from(reviewsTable),
    db.select().from(reviewsTable).orderBy(desc(reviewsTable.rating), desc(reviewsTable.createdAt)).limit(3),
  ]);

  const userMap = await buildUserMap(topRatedRaw.map((r) => r.userId));
  res.json({
    totalReviews: totals.totalReviews ?? 0,
    totalMovieReviews: totals.totalMovieReviews ?? 0,
    totalBookReviews: totals.totalBookReviews ?? 0,
    averageRating: Number(totals.averageRating ?? 0),
    topRated: withUsername(topRatedRaw, userMap),
  });
});

router.get("/reviews", async (req, res): Promise<void> => {
  const params = ListReviewsQueryParams.safeParse(req.query);
  const page = params.success ? (params.data.page ?? 1) : 1;
  const limit = params.success ? (params.data.limit ?? 12) : 12;
  const mediaType = params.success ? params.data.mediaType : undefined;
  const offset = (page - 1) * limit;

  const whereClause = mediaType ? eq(reviewsTable.mediaType, mediaType) : undefined;

  const [reviews, [{ count }]] = await Promise.all([
    db.select().from(reviewsTable)
      .where(whereClause)
      .orderBy(desc(reviewsTable.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: sql<number>`count(*)::int` }).from(reviewsTable).where(whereClause),
  ]);

  const userMap = await buildUserMap(reviews.map((r) => r.userId));
  res.json({ reviews: withUsername(reviews, userMap), total: count, page, limit });
});

router.post("/reviews", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = CreateReviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [review] = await db.insert(reviewsTable).values({
    userId: req.user!.userId,
    ...parsed.data,
  }).returning();

  res.status(201).json({ ...review, username: req.user!.username });
});

router.get("/reviews/:id", async (req, res): Promise<void> => {
  const params = GetReviewParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [review] = await db.select().from(reviewsTable).where(eq(reviewsTable.id, params.data.id)).limit(1);
  if (!review) {
    res.status(404).json({ error: "Review not found" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, review.userId)).limit(1);
  res.json({ ...review, username: user?.username ?? null });
});

router.delete("/reviews/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = DeleteReviewParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [review] = await db.select().from(reviewsTable).where(eq(reviewsTable.id, params.data.id)).limit(1);
  if (!review) {
    res.status(404).json({ error: "Review not found" });
    return;
  }
  if (review.userId !== req.user!.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  await db.delete(reviewsTable).where(eq(reviewsTable.id, params.data.id));
  res.sendStatus(204);
});

router.get("/users/:userId/reviews", async (req, res): Promise<void> => {
  const params = GetUserReviewsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const reviews = await db.select().from(reviewsTable)
    .where(eq(reviewsTable.userId, params.data.userId))
    .orderBy(desc(reviewsTable.createdAt));

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, params.data.userId)).limit(1);
  res.json(reviews.map((r) => ({ ...r, username: user?.username ?? null })));
});

export default router;
