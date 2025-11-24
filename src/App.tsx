import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Portal from "./pages/Portal";
import Auth from "./pages/Auth";
import About from "./pages/About";
import Product from "./pages/Product";
import Pricing from "./pages/Pricing";
import Checkout from "./pages/Checkout";
import CompanyProfile from "./pages/CompanyProfile";
import Admin from "./pages/Admin";
import AdminCompanyDetail from "./pages/AdminCompanyDetail";
import Intake from "./pages/Intake";
import FreemiumHub from "./pages/FreemiumHub";
import EducationalContent from "./pages/EducationalContent";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/portal" element={<Portal />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/intake" element={<Intake />} />
          <Route path="/hub" element={<FreemiumHub />} />
          <Route path="/hub/:slug" element={<EducationalContent />} />
          <Route path="/company" element={<CompanyProfile />} />
          <Route path="/about" element={<About />} />
          <Route path="/product" element={<Product />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/company/:companyId" element={<AdminCompanyDetail />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
