import React from "react";
import MobileNavigation from "./MobileNavigation";
import { cn } from "@/lib/utils";

interface MobileLayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
  className?: string;
}

const MobileLayout = ({ 
  children, 
  showNavigation = true,
  className 
}: MobileLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main content area */}
      <main 
        className={cn(
          "flex-1 page-transition",
          showNavigation && "pb-20", // Space for bottom navigation
          className
        )}
      >
        {children}
      </main>
      
      {/* Bottom navigation */}
      {showNavigation && <MobileNavigation />}
    </div>
  );
};

export default MobileLayout;
