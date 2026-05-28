import { useState } from "react";
import { useSearch, useAddToWatchlist } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, Film, BookOpen, Plus, PenSquare } from "lucide-react";
import { useSearch as useLocationSearch, Link, useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

export default function Search() {
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [type, setType] = useState<"movie" | "book">("movie");
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const { data: results, isLoading } = useSearch(
    { q: debouncedQ, type },
    { query: { enabled: debouncedQ.length > 2 } }
  );

  const addToWatchlist = useAddToWatchlist();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim().length > 2) {
      setDebouncedQ(q.trim());
    }
  };

  const handleAddToWatchlist = (item: any) => {
    if (!user) {
      toast("Please sign in", {
        description: "You need to be signed in to add items to your watchlist.",
      });
      setLocation("/login");
      return;
    }

    addToWatchlist.mutate(
      {
        data: {
          mediaType: item.mediaType,
          externalId: item.externalId,
          title: item.title,
          coverImageUrl: item.coverImageUrl,
        },
      },
      {
        onSuccess: () => {
          toast.success("Added to watchlist", {
            description: `${item.title} has been added to your watchlist.`,
          });
        },
        onError: () => {
          toast.error("Error", {
            description: "Failed to add item to watchlist. It might already be there.",
          });
        },
      }
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-5xl">
      <div className="space-y-4">
        <h1 className="text-3xl font-serif font-bold">Discover</h1>
        
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for movies or books..."
              className="pl-10 h-12 text-lg bg-card/50 border-border"
            />
          </div>
          <Button type="submit" size="lg" className="h-12 px-8">
            Search
          </Button>
        </form>

        <div className="flex gap-2">
          <Button
            variant={type === "movie" ? "default" : "outline"}
            onClick={() => setType("movie")}
            className="rounded-full"
          >
            <Film className="w-4 h-4 mr-2" />
            Movies
          </Button>
          <Button
            variant={type === "book" ? "default" : "outline"}
            onClick={() => setType("book")}
            className="rounded-full"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Books
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        )}

          {!isLoading && Array.isArray(results) && results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((item) => (
              <div
                key={item.externalId}
                className="flex gap-4 bg-card border border-border rounded-xl p-4 transition-all hover:border-primary/50"
              >
                <div className="w-20 h-28 bg-muted rounded overflow-hidden flex-shrink-0">
                  {item.coverImageUrl ? (
                    <img
                      src={item.coverImageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      {item.mediaType === "movie" ? <Film className="w-6 h-6 text-muted-foreground/50" /> : <BookOpen className="w-6 h-6 text-muted-foreground/50" />}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <h3 className="font-serif font-semibold text-lg leading-tight line-clamp-1">
                      {item.title}
                    </h3>
                    <div className="text-sm text-muted-foreground mt-1">
                      {item.year && <span>{item.year}</span>}
                      {item.author && <span> • {item.author}</span>}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleAddToWatchlist(item)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Watchlist
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      asChild
                    >
                      <Link
                        href={`/write-review?externalId=${item.externalId}&title=${encodeURIComponent(
                          item.title
                        )}&mediaType=${item.mediaType}&coverImageUrl=${encodeURIComponent(
                          item.coverImageUrl || ""
                        )}&year=${item.year || ""}`}
                      >
                        <PenSquare className="w-4 h-4 mr-2" />
                        Review
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && debouncedQ.length > 2 && results?.length === 0 && (
          <div className="text-center py-20 bg-card/50 rounded-xl border border-border border-dashed">
            <SearchIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-serif font-medium mb-2">No results found</h3>
            <p className="text-muted-foreground">
              We couldn't find any {type}s matching "{debouncedQ}".
            </p>
          </div>
        )}

        {!isLoading && debouncedQ.length <= 2 && (
          <div className="text-center py-20 text-muted-foreground">
            Type at least 3 characters to search
          </div>
        )}
      </div>
    </div>
  );
}
