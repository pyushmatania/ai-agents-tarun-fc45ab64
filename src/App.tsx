import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import HomePage from "./pages/HomePage";
import CoursesPage from "./pages/CoursesPage";
import ProgressPage from "./pages/ProgressPage";
import SettingsPage from "./pages/SettingsPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import MegaPromptPage from "./pages/MegaPromptPage";
import OnboardingPage from "./pages/OnboardingPage";
import AuthPage from "./pages/AuthPage";
import CuriosityPage from "./pages/CuriosityPage";
import SourcesPage from "./pages/SourcesPage";
import RoadmapPage from "./pages/RoadmapPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import ChatPage from "./pages/ChatPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const OnboardedRoute = ({ children }: { children: React.ReactNode }) => {
  const isOnboarded = localStorage.getItem("edu_onboarded") === "true";
  if (!isOnboarded) return <Navigate to="/welcome" replace />;
  return <>{children}</>;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/welcome" element={<OnboardingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/" element={<OnboardedRoute><HomePage /></OnboardedRoute>} />
            <Route path="/courses" element={<OnboardedRoute><CoursesPage /></OnboardedRoute>} />
            <Route path="/curiosity" element={<OnboardedRoute><CuriosityPage /></OnboardedRoute>} />
            <Route path="/progress" element={<OnboardedRoute><ProgressPage /></OnboardedRoute>} />
            <Route path="/sources" element={<OnboardedRoute><SourcesPage /></OnboardedRoute>} />
            <Route path="/roadmap" element={<OnboardedRoute><RoadmapPage /></OnboardedRoute>} />
            <Route path="/leaderboard" element={<OnboardedRoute><LeaderboardPage /></OnboardedRoute>} />
            <Route path="/settings" element={<OnboardedRoute><SettingsPage /></OnboardedRoute>} />
            <Route path="/chat" element={<OnboardedRoute><ChatPage /></OnboardedRoute>} />
            <Route path="/course/:id" element={<OnboardedRoute><CourseDetailPage /></OnboardedRoute>} />
            <Route path="/mega-prompt" element={<OnboardedRoute><MegaPromptPage /></OnboardedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
