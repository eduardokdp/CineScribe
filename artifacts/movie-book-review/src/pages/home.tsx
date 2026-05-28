import { useGetRecentReviews, useGetReviewStats } from "@workspace/api-client-react";
import { ReviewCard } from "@/components/review-card";
import { Film, BookOpen, Star, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: stats, isLoading: statsLoading } = useGetReviewStats();
  const { data: recentReviews, isLoading: reviewsLoading } = useGetRecentReviews({ limit: 12 });

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-serif font-bold tracking-tight mb-2">CineScribe</h1>
            <p className="text-muted-foreground">Log, rate, and review your cinematic and literary journeys.</p>
          </div>
        </div>

        {statsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : stats ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<TrendingUp />} label="Total Reviews" value={stats.totalReviews} />
          <StatCard icon={<Film />} label="Movies Logged" value={stats.totalMovieReviews} />
          <StatCard icon={<BookOpen />} label="Books Read" value={stats.totalBookReviews} />
          <StatCard
            icon={<Star className="text-primary fill-primary" />}
            label="Avg Rating"
            value={stats.averageRating?.toFixed(1) ?? "0.0"}
          />
        </div>
        ) : null}
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-2xl font-serif font-semibold">Recent Activity</h2>
        </div>

        {reviewsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] w-full rounded-xl" />
            ))}
          </div>
        ) : Array.isArray(recentReviews) && recentReviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recentReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-card rounded-xl border border-border">
            <p className="text-muted-foreground">No reviews yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-2">
      <div className="text-muted-foreground w-5 h-5">{icon}</div>
      <div>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</div>
      </div>
    </div>
  );
}
