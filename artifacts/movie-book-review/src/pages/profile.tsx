import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useGetUserReviews, getGetUserReviewsQueryKey, useGetWatchlist, getGetWatchlistQueryKey, useRemoveFromWatchlist } from "@workspace/api-client-react";
import { ReviewCard } from "@/components/review-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Trash2, Film, BookOpen, PenSquare } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";

export default function Profile() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) {
      setLocation("/login");
    }
  }, [user, setLocation]);

  if (!user) return null;

  const { data: reviews, isLoading: reviewsLoading } = useGetUserReviews(user.id, {
    query: { enabled: !!user.id, queryKey: getGetUserReviewsQueryKey(user.id) },
  });

  const { data: watchlist, isLoading: watchlistLoading } = useGetWatchlist({
    query: { queryKey: getGetWatchlistQueryKey() },
  });

  const removeFromWatchlist = useRemoveFromWatchlist();

  const handleRemoveWatchlist = (id: number, title: string) => {
    removeFromWatchlist.mutate(
      { id },
      {
        onSuccess: () => {
          toast.success("Removed", { description: `${title} removed from watchlist.` });
          queryClient.invalidateQueries({ queryKey: getGetWatchlistQueryKey() });
        },
      }
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      <div className="bg-card border border-border rounded-2xl p-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="w-24 h-24 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center text-primary text-3xl font-serif font-bold flex-shrink-0">
          {user.username.charAt(0).toUpperCase()}
        </div>
        
        <div className="text-center md:text-left space-y-2 z-10">
          <h1 className="text-3xl font-serif font-bold">{user.username}</h1>
          <p className="text-muted-foreground">Member since {new Date(user.createdAt).getFullYear()}</p>
        </div>
      </div>

      <Tabs defaultValue="reviews" className="w-full">
        <TabsList className="mb-8 bg-card border border-border">
          <TabsTrigger value="reviews" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            My Reviews ({reviews?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="watchlist" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Watchlist ({watchlist?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="space-y-6 focus:outline-none">
          {reviewsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3] w-full rounded-xl" />
              ))}
            </div>
          ) : reviews && reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-card rounded-xl border border-border border-dashed">
              <PenSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-serif font-medium mb-2">No reviews yet</h3>
              <p className="text-muted-foreground mb-6">Start logging your cinematic and literary experiences.</p>
              <Button asChild>
                <Link href="/search">Find something to review</Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="watchlist" className="space-y-6 focus:outline-none">
          {watchlistLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3] w-full rounded-xl" />
              ))}
            </div>
          ) : watchlist && watchlist.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {watchlist.map((item) => (
                <div key={item.id} className="group relative bg-card border border-border rounded-xl overflow-hidden">
                  <div className="aspect-[2/3] w-full bg-muted relative">
                    {item.coverImageUrl ? (
                      <img
                        src={item.coverImageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-4">
                        {item.mediaType === "movie" ? <Film className="w-8 h-8 opacity-20" /> : <BookOpen className="w-8 h-8 opacity-20" />}
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                      <Button
                        size="sm"
                        variant="destructive"
                        className="w-full"
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemoveWatchlist(item.id, item.title);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                  <div className="p-3 bg-card border-t border-border z-10 relative">
                    <h3 className="font-serif font-medium text-sm line-clamp-1" title={item.title}>
                      {item.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-card rounded-xl border border-border border-dashed">
              <Film className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-serif font-medium mb-2">Watchlist empty</h3>
              <p className="text-muted-foreground mb-6">Keep track of movies and books you want to experience.</p>
              <Button asChild>
                <Link href="/search">Discover</Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
