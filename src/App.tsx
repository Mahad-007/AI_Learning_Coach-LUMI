import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Navigation } from "./components/Navigation";
import { Footer } from "./components/Footer";
import { lazy, Suspense } from "react";
import { useActivityTracker } from "./hooks/useActivityTracker";

// Eager load critical pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Lazy load non-critical pages for better performance
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Chat = lazy(() => import("./pages/Chat"));
const Quiz = lazy(() => import("./pages/Quiz"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Learn = lazy(() => import("./pages/Learn"));
const Profile = lazy(() => import("./pages/Profile"));
const Whiteboard = lazy(() => import("./pages/Whiteboard"));
const NotFound = lazy(() => import("./pages/NotFound"));
const TriviaLobby = lazy(() => import("./pages/Trivia/TriviaLobby"));
const TriviaRoom = lazy(() => import("./pages/Trivia/TriviaRoom"));
const TriviaGame = lazy(() => import("./pages/Trivia/TriviaGame"));
const TriviaLeaderboard = lazy(() => import("./pages/Trivia/TriviaLeaderboard"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const Features = lazy(() => import("./pages/Features"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Blog = lazy(() => import("./pages/Blog"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));
const FAQ = lazy(() => import("./pages/FAQ"));
const AIEducationFuture = lazy(() => import("./pages/blog/AIEducationFuture"));
const Friends = lazy(() => import("./pages/Friends"));
const LearningStrategies = lazy(() => import("./pages/blog/LearningStrategies"));
const GamificationLearning = lazy(() => import("./pages/blog/GamificationLearning"));
const TimeManagement = lazy(() => import("./pages/blog/TimeManagement"));
const SpacedRepetition = lazy(() => import("./pages/blog/SpacedRepetition"));
const LearningHabits = lazy(() => import("./pages/blog/LearningHabits"));
const AIvsTraditionalTutoring = lazy(() => import("./pages/blog/AIvsTraditionalTutoring"));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

// Optimized QueryClient with better defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const AppLayout = () => {
  const location = useLocation();
  const hideFooter = location.pathname === "/chat";
  
  // Track user activity for inactivity reminders
  useActivityTracker();

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
            <Route path="/trivia" element={<ProtectedRoute><TriviaLobby /></ProtectedRoute>} />
            <Route path="/trivia/room/:roomId" element={<ProtectedRoute><TriviaRoom /></ProtectedRoute>} />
            <Route path="/trivia/game/:roomId" element={<ProtectedRoute><TriviaGame /></ProtectedRoute>} />
            <Route path="/trivia/leaderboard/:roomId" element={<ProtectedRoute><TriviaLeaderboard /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
            <Route path="/learn" element={<ProtectedRoute><Learn /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/whiteboard" element={<ProtectedRoute><Whiteboard /></ProtectedRoute>} />
            
            {/* Static Pages */}
            <Route path="/about" element={<AboutUs />} />
            <Route path="/features" element={<Features />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/ai-education-future" element={<AIEducationFuture />} />
            <Route path="/blog/learning-strategies" element={<LearningStrategies />} />
            <Route path="/blog/gamification-learning" element={<GamificationLearning />} />
            <Route path="/blog/time-management" element={<TimeManagement />} />
            <Route path="/blog/spaced-repetition" element={<SpacedRepetition />} />
            <Route path="/blog/learning-habits" element={<LearningHabits />} />
            <Route path="/blog/ai-vs-traditional-tutoring" element={<AIvsTraditionalTutoring />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};

import { ThemeProvider } from "next-themes";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <AppLayout />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
