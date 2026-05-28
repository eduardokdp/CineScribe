import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  max?: number;
  onRatingChange?: (rating: number) => void;
  readOnly?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function StarRating({
  rating,
  max = 5,
  onRatingChange,
  readOnly = true,
  className,
  size = "md",
}: StarRatingProps) {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-6 h-6",
    xl: "w-8 h-8",
  };

  return (
    <div className={cn("flex items-center space-x-1", className)}>
      {Array.from({ length: max }).map((_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= rating;
        
        return (
          <button
            key={i}
            type="button"
            disabled={readOnly}
            onClick={() => onRatingChange?.(starValue)}
            className={cn(
              "transition-all duration-200",
              !readOnly && "hover:scale-110 cursor-pointer focus:outline-none",
              readOnly && "cursor-default"
            )}
          >
            <Star
              className={cn(
                sizeClasses[size],
                isFilled
                  ? "fill-primary text-primary"
                  : "fill-transparent text-muted-foreground"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
