import { useState } from "react";
import { useListReviews } from "@workspace/api-client-react";
import { ReviewCard } from "@/components/review-card";
import { Film, BookOpen, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function Browse() {
  const [mediaType, setMediaType] = useState<"movie" | "book" | undefined>(undefined);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useListReviews({
    page,
    limit: 12,
    mediaType,
  });

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">Browse Reviews</h1>
          <p className="text-muted-foreground mt-2">Explore thoughts from the community.</p>
        </div>

        <div className="flex gap-2">
          <Button
            variant={mediaType === undefined ? "default" : "outline"}
            onClick={() => {
              setMediaType(undefined);
              setPage(1);
            }}
            className="rounded-full"
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            All
          </Button>
          <Button
            variant={mediaType === "movie" ? "default" : "outline"}
            onClick={() => {
              setMediaType("movie");
              setPage(1);
            }}
            className="rounded-full"
          >
            <Film className="w-4 h-4 mr-2" />
            Movies
          </Button>
          <Button
            variant={mediaType === "book" ? "default" : "outline"}
            onClick={() => {
              setMediaType("book");
              setPage(1);
            }}
            className="rounded-full"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Books
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] w-full rounded-xl" />
          ))}
        </div>
      ) : data?.reviews && data.reviews.length > 0 ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>

          {data.total > data.limit && (
            <div className="flex justify-center gap-2 pt-8">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <div className="flex items-center px-4 text-sm text-muted-foreground font-medium">
                Page {page} of {Math.ceil(data.total / data.limit)}
              </div>
              <Button
                variant="outline"
                disabled={page >= Math.ceil(data.total / data.limit)}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-24 bg-card rounded-xl border border-border">
          <p className="text-muted-foreground">No reviews found for this category.</p>
        </div>
      )}
    </div>
  );
}
