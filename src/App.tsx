import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import RoleSelection from "./pages/RoleSelection";
import PartnerServiceSetup from "./pages/PartnerServiceSetup";
import UserDashboard from "./pages/UserDashboard";
import PartnerDashboard from "./pages/PartnerDashboard";
import Dashboard from "./pages/Dashboard";
import SymptomCheckerPage from "./pages/SymptomCheckerPage";
import DoctorsPage from "./pages/DoctorsPage";
import MedicineRemindersPage from "./pages/MedicineRemindersPage";
import HospitalSearchPage from "./pages/HospitalSearchPage";
import SOSPage from "./pages/SOSPage";
import AllServicesPage from "./pages/AllServicesPage";
import MedicalShopPage from "./pages/MedicalShopPage";
import PregnancyCarePage from "./pages/PregnancyCarePage";
import HomeNursingPage from "./pages/HomeNursingPage";
import MentalHealthPage from "./pages/MentalHealthPage";
import InsurancePage from "./pages/InsurancePage";
import HomeRemediesPage from "./pages/HomeRemediesPage";
import DietPlansPage from "./pages/DietPlansPage";
import FitnessRecoveryPage from "./pages/FitnessRecoveryPage";
import MyRecordsPage from "./pages/MyRecordsPage";
import FindFoodPage from "./pages/FindFoodPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import HospitalDataPage from "./pages/partner/HospitalDataPage";
import SOSAlertsPage from "./pages/partner/SOSAlertsPage";
import AppointmentsPage from "./pages/partner/AppointmentsPage";
import PartnerServicesList from "./pages/PartnerServicesList";
import HospitalDashboard from "./pages/partner/HospitalDashboard";
import GynecologistDashboard from "./pages/partner/GynecologistDashboard";
import MentalHealthDashboard from "./pages/partner/MentalHealthDashboard";
import HomeNursingDashboard from "./pages/partner/HomeNursingDashboard";
import AmbulanceDashboard from "./pages/partner/AmbulanceDashboard";
import MedicalShopDashboard from "./pages/partner/MedicalShopDashboard";
import RestaurantDashboard from "./pages/partner/RestaurantDashboard";
import FitnessDashboard from "./pages/partner/FitnessDashboard";
import InsuranceDashboard from "./pages/partner/InsuranceDashboard";
import ElderAdviceDashboard from "./pages/partner/ElderAdviceDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/role-selection" element={<RoleSelection />} />
            <Route path="/partner-service-setup" element={<PartnerServiceSetup />} />
            <Route path="/user-dashboard" element={<UserDashboard />} />
            <Route path="/partner-dashboard" element={<PartnerDashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/symptom-checker" element={<SymptomCheckerPage />} />
            <Route path="/doctors" element={<DoctorsPage />} />
            <Route path="/hospitals" element={<HospitalSearchPage />} />
            <Route path="/sos" element={<SOSPage />} />
            <Route path="/reminders" element={<MedicineRemindersPage />} />
            <Route path="/all-services" element={<AllServicesPage />} />
            <Route path="/medical-shop" element={<MedicalShopPage />} />
            <Route path="/home-remedies" element={<HomeRemediesPage />} />
            <Route path="/diet-plans" element={<DietPlansPage />} />
            <Route path="/fitness-recovery" element={<FitnessRecoveryPage />} />
            <Route path="/my-records" element={<MyRecordsPage />} />
            <Route path="/find-food" element={<FindFoodPage />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route path="/partner-services" element={<PartnerServicesList />} />
            <Route path="/partner/hospital-dashboard" element={<HospitalDashboard />} />
            <Route path="/partner/gynecologist-dashboard" element={<GynecologistDashboard />} />
            <Route path="/partner/mental-health-dashboard" element={<MentalHealthDashboard />} />
            <Route path="/partner/home-nursing-dashboard" element={<HomeNursingDashboard />} />
            <Route path="/partner/ambulance-dashboard" element={<AmbulanceDashboard />} />
            <Route path="/partner/ambulance" element={<AmbulanceDashboard />} />
            <Route path="/partner/medical-shop-dashboard" element={<MedicalShopDashboard />} />
            <Route path="/partner/restaurant-dashboard" element={<RestaurantDashboard />} />
            <Route path="/partner/fitness-dashboard" element={<FitnessDashboard />} />
            <Route path="/partner/insurance-dashboard" element={<InsuranceDashboard />} />
            <Route path="/partner/elder-advice-dashboard" element={<ElderAdviceDashboard />} />
            <Route path="/partner/hospital-data" element={<HospitalDataPage />} />
            <Route path="/partner/sos-alerts" element={<SOSAlertsPage />} />
            <Route path="/partner/appointments" element={<AppointmentsPage />} />
            <Route path="/elder-experts" element={<DoctorsPage />} />
            <Route path="/mental-health" element={<MentalHealthPage />} />
            <Route path="/pregnancy-care" element={<PregnancyCarePage />} />
            <Route path="/home-nursing" element={<HomeNursingPage />} />
            <Route path="/insurance" element={<InsurancePage />} />
            <Route path="/bookings" element={<DoctorsPage />} />
            <Route path="/profile" element={<UserDashboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
