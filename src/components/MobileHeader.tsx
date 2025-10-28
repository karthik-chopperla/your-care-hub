import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bell, Heart } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  showNotifications?: boolean;
  showLogo?: boolean;
  rightAction?: React.ReactNode;
  className?: string;
}

const MobileHeader = ({
  title,
  showBack = false,
  showNotifications = true,
  showLogo = false,
  rightAction,
  className
}: MobileHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header 
      className={cn(
        "sticky top-0 z-40 w-full bg-background/95 backdrop-blur border-b border-border/40",
        "pt-[var(--safe-area-top)]",
        className
      )}
      style={{ height: "var(--top-nav-height)" }}
    >
      <div className="flex items-center justify-between px-4 h-full">
        {/* Left section */}
        <div className="flex items-center gap-3 flex-1">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="h-9 w-9"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          
          {showLogo && (
            <Link to="/user-dashboard" className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-hero">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold">Health Mate</span>
            </Link>
          )}
          
          {title && !showLogo && (
            <h1 className="text-lg font-semibold truncate">{title}</h1>
          )}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {showNotifications && (
            <Button variant="ghost" size="icon" className="h-9 w-9 relative" asChild>
              <Link to="/notifications">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-urgent rounded-full" />
              </Link>
            </Button>
          )}
          {rightAction}
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
