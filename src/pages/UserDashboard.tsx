import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Pill, Stethoscope, User } from "lucide-react";

const UserDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome to Your Dashboard</h1>
            <p className="text-muted-foreground">Your health information center</p>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Appointments Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-primary" />
                <CardTitle>Appointments</CardTitle>
              </div>
              <CardDescription>
                Manage your healthcare appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">View Appointments</Button>
            </CardContent>
          </Card>

          {/* Symptom Checker Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Stethoscope className="h-5 w-5 text-primary" />
                <CardTitle>Symptom Checker</CardTitle>
              </div>
              <CardDescription>
                Check your symptoms and get guidance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Check Symptoms</Button>
            </CardContent>
          </Card>

          {/* Medicine Reminders Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Pill className="h-5 w-5 text-primary" />
                <CardTitle>Medicine Reminders</CardTitle>
              </div>
              <CardDescription>
                Set up medicine reminder schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Manage Reminders</Button>
            </CardContent>
          </Card>

          {/* Profile Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle>Profile</CardTitle>
              </div>
              <CardDescription>
                Manage your profile information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">Edit Profile</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;