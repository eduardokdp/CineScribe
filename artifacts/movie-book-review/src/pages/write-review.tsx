import { useState, useEffect } from "react";
import { useSearch as useLocationSearch, useLocation } from "wouter";
import { useCreateReview } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { StarRating } from "@/components/star-rating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Film, BookOpen } from "lucide-react";
import { toast } from "sonner";


export default function WriteReview() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const searchString = useLocationSearch();
  const searchParams = new URLSearchParams(searchString);

  const externalId = searchParams.get("externalId") || "";
  const title = searchParams.get("title") || "";
  const mediaType = (searchParams.get("mediaType") as "movie" | "book") || "movie";
  const coverImageUrl = searchParams.get("coverImageUrl") || "";
  const year = searchParams.get("year") || "";

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  const createReview = useCreateReview();

  useEffect(() => {
    if (!user) {
      toast("Authentication required", {
        description: "Please sign in to write a review.",
      });
      setLocation("/login");
    }
  }, [user, setLocation]);

  if (!user) return null;

  if (!externalId || !title) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-serif mb-4">No media selected</h1>
        <p className="text-muted-foreground mb-8">Please search for a movie or book to review first.</p>
        <Button onClick={() => setLocation("/search")}>Go to Search</Button>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error("Rating required", { description: "Please provide a star rating." });
      return;
    }
    
    if (reviewText.trim().length < 1) {
      toast.error("Review too short", { description: "Please write at least one word." });
      return;
    }

    createReview.mutate(
      {
        data: {
          mediaType,
          externalId,
          title,
          coverImageUrl: coverImageUrl || undefined,
          year: year || undefined,
          rating,
          reviewText,
        },
      },
      {
        onSuccess: (newReview) => {
          toast.success("Review published!");
          setLocation(`/reviews/${newReview.id}`);
        },
        onError: () => {
          toast.error("Error", { description: "Failed to publish review. Please try again." });
        },
      }
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold tracking-tight">I logged...</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3 lg:w-1/4">
          <div className="rounded-xl overflow-hidden shadow-xl border border-border/50 sticky top-24">
            {coverImageUrl ? (
              <img
                src={coverImageUrl}
                alt={title}
                className="w-full aspect-[2/3] object-cover"
              />
            ) : (
              <div className="w-full aspect-[2/3] flex flex-col items-center justify-center bg-muted p-4 text-center">
                {mediaType === "movie" ? <Film className="w-12 h-12 text-muted-foreground/30 mb-2" /> : <BookOpen className="w-12 h-12 text-muted-foreground/30 mb-2" />}
                <span className="text-muted-foreground font-serif font-medium">{title}</span>
              </div>
            )}
            <div className="p-4 bg-card border-t border-border text-center">
              <h3 className="font-serif font-semibold leading-tight">{title}</h3>
              {year && <span className="text-xs text-muted-foreground">{year}</span>}
            </div>
          </div>
        </div>

        <div className="w-full md:w-2/3 lg:w-3/4">
          <form onSubmit={handleSubmit} className="space-y-8 bg-card border border-border p-6 sm:p-8 rounded-xl">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Rating
              </label>
              <div className="flex items-center gap-4">
                <StarRating
                  rating={rating}
                  onRatingChange={setRating}
                  readOnly={false}
                  size="xl"
                />
                <span className="text-sm font-medium text-muted-foreground">
                  {rating > 0 ? `${rating} out of 5` : "Select rating"}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <label htmlFor="review" className="block text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Review
              </label>
              <Textarea
                id="review"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="What did you think? Share your thoughts, critique, or praise..."
                className="min-h-[250px] resize-y text-base p-4 leading-relaxed bg-background/50 focus:bg-background transition-colors"
              />
            </div>

            <div className="pt-4 border-t border-border">
              <Button
                type="submit"
                size="lg"
                className="w-full sm:w-auto"
                disabled={createReview.isPending}
              >
                {createReview.isPending ? "Publishing..." : "Publish Review"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
