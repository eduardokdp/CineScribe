import { Router } from "express";
import { db, watchlistTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { AddToWatchlistBody, RemoveFromWatchlistParams } from "@workspace/api-zod";
import { requireAuth, type AuthRequest } from "../lib/auth";

const router = Router();

router.get("/watchlist", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const items = await db.select().from(watchlistTable).where(eq(watchlistTable.userId, req.user!.userId));
  res.json(items);
});

router.post("/watchlist", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = AddToWatchlistBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [item] = await db.insert(watchlistTable).values({
    userId: req.user!.userId,
    ...parsed.data,
  }).returning();

  res.status(201).json(item);
});

router.delete("/watchlist/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = RemoveFromWatchlistParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [item] = await db.select().from(watchlistTable)
    .where(and(eq(watchlistTable.id, params.data.id), eq(watchlistTable.userId, req.user!.userId)))
    .limit(1);

  if (!item) {
    res.status(404).json({ error: "Watchlist item not found" });
    return;
  }

  await db.delete(watchlistTable).where(eq(watchlistTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
