import { Link } from "wouter";
import { Review } from "@workspace/api-client-react";
import { StarRating } from "./star-rating";
import { format } from "date-fns";
import { Film, Book } from "lucide-react";

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <Link href={`/reviews/${review.id}`} className="group block h-full">
      <article className="flex flex-col h-full bg-card rounded-lg border border-border overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
        <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted">
          {review.coverImageUrl ? (
            <img
              src={review.coverImageUrl}
              alt={review.title}
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
              {review.mediaType === "movie" ? (
                <Film className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
              ) : (
                <Book className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
              )}
              <span className="text-muted-foreground font-serif font-medium">{review.title}</span>
            </div>
          )}
          <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md border border-border/50 text-xs font-medium flex items-center gap-1">
            <StarRating rating={review.rating} size="sm" />
          </div>
        </div>
        
        <div className="p-4 flex flex-col flex-grow">
          <div className="mb-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span className="uppercase tracking-wider">{review.mediaType}</span>
            {review.year && <span>{review.year}</span>}
          </div>
          
          <h3 className="font-serif text-lg font-semibold leading-tight mb-2 line-clamp-1 group-hover:text-primary transition-colors">
            {review.title}
          </h3>
          
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-grow">
            {review.reviewText}
          </p>
          
          <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {review.username || "Anonymous"}
            </span>
            <span>{format(new Date(review.createdAt), "MMM d, yyyy")}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
