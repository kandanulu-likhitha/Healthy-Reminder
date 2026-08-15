import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import { Loader2 } from "lucide-react";

const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Profile = lazy(() => import("./pages/Profile"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const DiseaseDetail = lazy(() => import("./pages/DiseaseDetail"));
const Reminders = lazy(() => import("./pages/Reminders"));
const Shop = lazy(() => import("./pages/Shop"));
const Doctors = lazy(() => import("./pages/Doctors"));
const HealthTracking = lazy(() => import("./pages/HealthTracking"));
const MedicineInventory = lazy(() => import("./pages/MedicineInventory"));
const EmergencyContacts = lazy(() => import("./pages/EmergencyContacts"));
const AdherenceReport = lazy(() => import("./pages/AdherenceReport"));
const ChatConsultation = lazy(() => import("./pages/ChatConsultation"));
const DailyLog = lazy(() => import("./pages/DailyLog"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Orders = lazy(() => import("./pages/Orders"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const PageFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Header />
          <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/disease/:id" element={<DiseaseDetail />} />
            <Route path="/reminders" element={<Reminders />} />
            <Route path="/reminders/new" element={<Reminders />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/health-tracking" element={<HealthTracking />} />
            <Route path="/medicine-inventory" element={<MedicineInventory />} />
            <Route path="/emergency-contacts" element={<EmergencyContacts />} />
            <Route path="/adherence-report" element={<AdherenceReport />} />
            <Route path="/chat/:consultationId" element={<ChatConsultation />} />
            <Route path="/daily-log" element={<DailyLog />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
