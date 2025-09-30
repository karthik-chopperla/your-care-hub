import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, FileText, BarChart3 } from "lucide-react";

const PartnerDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Partner Dashboard</h1>
            <p className="text-muted-foreground">Healthcare partner portal</p>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Manage Appointments Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-primary" />
                <CardTitle>Manage Appointments</CardTitle>
              </div>
              <CardDescription>
                View and schedule patient appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">View Schedule</Button>
            </CardContent>
          </Card>

          {/* Patient Records Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle>Patient Records</CardTitle>
              </div>
              <CardDescription>
                Access patient information and history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">View Patients</Button>
            </CardContent>
          </Card>

          {/* Documents Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle>Medical Documents</CardTitle>
              </div>
              <CardDescription>
                Manage prescriptions and reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">View Documents</Button>
            </CardContent>
          </Card>

          {/* Analytics Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <CardTitle>Analytics</CardTitle>
              </div>
              <CardDescription>
                View practice statistics and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">View Analytics</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PartnerDashboard;