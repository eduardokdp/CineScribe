import { Link } from "wouter";
import { Film } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 text-center">
      <Film className="w-24 h-24 text-muted-foreground/30 mb-8" />
      <h1 className="text-4xl font-serif font-bold mb-4">Scene Missing</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        The page you're looking for has been cut from the final edit. It might have been moved or deleted.
      </p>
      <Button asChild size="lg">
        <Link href="/">Return to Home</Link>
      </Button>
    </div>
  );
}
