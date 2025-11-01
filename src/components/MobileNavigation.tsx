import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Home, Calendar, AlertTriangle, Pill, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const MobileNavigation = () => {
  const location = useLocation();
  const [userRole, setUserRole] = useState<'user' | 'partner' | null>(null);
  
  useEffect(() => {
    const checkUserRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();
        
        setUserRole(roles?.role as 'user' | 'partner' || null);
      }
    };
    checkUserRole();
  }, []);

  // Don't show navigation for partners
  if (userRole === 'partner') {
    return null;
  }
  
  const navItems = [
    {
      icon: Home,
      label: "Home",
      href: "/user-dashboard",
      active: location.pathname === "/user-dashboard"
    },
    {
      icon: Calendar,
      label: "Bookings",
      href: "/bookings",
      active: location.pathname === "/bookings"
    },
    {
      icon: AlertTriangle,
      label: "SOS",
      href: "/sos",
      active: location.pathname === "/sos"
    },
    {
      icon: Pill,
      label: "Reminders",
      href: "/reminders",
      active: location.pathname === "/reminders"
    },
    {
      icon: User,
      label: "Profile",
      href: "/profile",
      active: location.pathname === "/profile"
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 px-4 py-2 md:hidden">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.href}
              variant={item.active ? "default" : "ghost"}
              size="sm"
              asChild
              className={`flex flex-col h-auto py-2 px-3 ${
                item.active 
                  ? "text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Link to={item.href} className="flex flex-col items-center gap-1">
                <Icon className="h-4 w-4" />
                <span className="text-xs">{item.label}</span>
              </Link>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNavigation;