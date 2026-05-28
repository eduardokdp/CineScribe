import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Film, Search, User, LogOut, Clapperboard, BookOpen } from "lucide-react";
import { Button } from "./ui/button";

export function NavBar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Clapperboard className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
          <span className="font-serif font-bold text-xl tracking-tight">CineScribe</span>
        </Link>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className={`text-sm font-medium transition-colors hover:text-primary ${isActive("/") ? "text-primary" : "text-muted-foreground"}`}>
              Home
            </Link>
            <Link href="/search" className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 ${isActive("/search") ? "text-primary" : "text-muted-foreground"}`}>
              <Search className="w-4 h-4" />
              Search
            </Link>
            <Link href="/reviews" className={`text-sm font-medium transition-colors hover:text-primary ${isActive("/reviews") ? "text-primary" : "text-muted-foreground"}`}>
              Browse
            </Link>
          </div>

          <div className="flex items-center gap-4 border-l border-border pl-6">
            {user ? (
              <>
                <Link href="/profile" className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${isActive("/profile") ? "text-primary" : "text-muted-foreground"}`}>
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{user.username}</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={logout} title="Log out">
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button variant="default" size="sm" className="font-medium">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
