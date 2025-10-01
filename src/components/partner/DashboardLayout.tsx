import { ReactNode, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Database, Calendar, Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface DashboardLayoutProps {
  title: string;
  subtitle: string;
  overviewContent: ReactNode;
  dataManagerContent: ReactNode;
  bookingsContent: ReactNode;
  notificationsContent: ReactNode;
  profileContent: ReactNode;
}

export default function DashboardLayout({
  title,
  subtitle,
  overviewContent,
  dataManagerContent,
  bookingsContent,
  notificationsContent,
  profileContent
}: DashboardLayoutProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/partner-services")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Services
          </Button>
          <h1 className="text-4xl font-bold mb-2">{title}</h1>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">Data Manager</span>
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Bookings</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {overviewContent}
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            {dataManagerContent}
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            {bookingsContent}
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            {notificationsContent}
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            {profileContent}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
