import { Router } from "express";
import { logger } from "../lib/logger";

const router = Router();

const OMDB_API_KEY = process.env.OMDB_API_KEY;

async function searchMovies(query: string): Promise<unknown[]> {
  if (!OMDB_API_KEY) {
    logger.warn("OMDB_API_KEY not set");
    return [];
  }
  const url = `https://www.omdbapi.com/?s=${encodeURIComponent(query)}&type=movie&apikey=${OMDB_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json() as { Response: string; Search?: { imdbID: string; Title: string; Year: string; Poster: string }[] };
  if (data.Response !== "True" || !data.Search) return [];
  return data.Search.map((item) => ({
    externalId: item.imdbID,
    title: item.Title,
    mediaType: "movie",
    coverImageUrl: item.Poster !== "N/A" ? item.Poster : null,
    year: item.Year ?? null,
    author: null,
  }));
}

async function searchBooks(query: string): Promise<unknown[]> {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10`;
  const res = await fetch(url);
  const data = await res.json() as { items?: { id: string; volumeInfo: { title: string; publishedDate?: string; authors?: string[]; imageLinks?: { thumbnail?: string } } }[] };
  if (!data.items) return [];
  return data.items.map((item) => {
    const info = item.volumeInfo;
    const thumb = info.imageLinks?.thumbnail ?? null;
    const cover = thumb ? thumb.replace("http://", "https://") : null;
    return {
      externalId: item.id,
      title: info.title,
      mediaType: "book",
      coverImageUrl: cover,
      year: info.publishedDate ? info.publishedDate.slice(0, 4) : null,
      author: info.authors ? info.authors[0] : null,
    };
  });
}

router.get("/search", async (req, res): Promise<void> => {
  const q = req.query.q as string;
  const type = req.query.type as string;

  if (!q || !type) {
    res.status(400).json({ error: "q and type are required" });
    return;
  }

  if (type !== "movie" && type !== "book") {
    res.status(400).json({ error: "type must be movie or book" });
    return;
  }

  const results = type === "movie" ? await searchMovies(q) : await searchBooks(q);
  res.json(results);
});

export default router;
