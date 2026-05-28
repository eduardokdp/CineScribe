import { useParams } from "wouter";
import { useGetReview, getGetReviewQueryKey } from "@workspace/api-client-react";
import { StarRating } from "@/components/star-rating";
import { format } from "date-fns";
import { Film, BookOpen, Calendar, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReviewDetail() {
  const { id } = useParams<{ id: string }>();
  const reviewId = parseInt(id || "0", 10);

  const { data: review, isLoading } = useGetReview(reviewId, {
    query: { enabled: !!reviewId, queryKey: getGetReviewQueryKey(reviewId) },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3 flex-shrink-0">
            <Skeleton className="aspect-[2/3] w-full rounded-xl" />
          </div>
          <div className="w-full md:w-2/3 space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-serif mb-4">Review not found</h1>
        <p className="text-muted-foreground">This review may have been deleted or doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        <div className="w-full md:w-1/3 flex-shrink-0">
          <div className="rounded-xl overflow-hidden shadow-2xl border border-border/50 sticky top-24">
            {review.coverImageUrl ? (
              <img
                src={review.coverImageUrl}
                alt={review.title}
                className="w-full aspect-[2/3] object-cover"
              />
            ) : (
              <div className="w-full aspect-[2/3] flex flex-col items-center justify-center bg-muted p-6 text-center">
                {review.mediaType === "movie" ? (
                  <Film className="w-16 h-16 text-muted-foreground mb-4 opacity-20" />
                ) : (
                  <BookOpen className="w-16 h-16 text-muted-foreground mb-4 opacity-20" />
                )}
                <span className="text-muted-foreground font-serif font-medium text-lg">
                  {review.title}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="w-full md:w-2/3 py-4">
          <div className="mb-6 space-y-4">
            <div className="flex items-center gap-3 text-sm text-primary uppercase tracking-widest font-semibold">
              {review.mediaType === "movie" ? <Film className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
              <span>{review.mediaType}</span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-serif font-bold leading-tight">
              {review.title}
              {review.year && (
                <span className="text-muted-foreground font-normal ml-3 text-3xl">
                  ({review.year})
                </span>
              )}
            </h1>

            <div className="flex flex-wrap items-center gap-6 py-4 border-y border-border/50">
              <div className="flex items-center gap-2">
                <StarRating rating={review.rating} size="lg" />
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4" />
                <span className="font-medium text-foreground">{review.username || "Anonymous"}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(review.createdAt), "MMMM d, yyyy")}</span>
              </div>
            </div>
          </div>

          <div className="prose prose-invert lg:prose-lg max-w-none prose-headings:font-serif">
            <p className="whitespace-pre-wrap leading-relaxed text-foreground/90">
              {review.reviewText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
