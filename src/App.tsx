import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Navigation } from "./components/Navigation";
import { Footer } from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Quiz from "./pages/Quiz";
import Leaderboard from "./pages/Leaderboard";
import Lesson from "./pages/Lesson";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import TriviaLobby from "./pages/Trivia/TriviaLobby";
import TriviaRoom from "./pages/Trivia/TriviaRoom";
import TriviaGame from "./pages/Trivia/TriviaGame";
import TriviaLeaderboard from "./pages/Trivia/TriviaLeaderboard";
import AboutUs from "./pages/AboutUs";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import Blog from "./pages/Blog";
import ContactUs from "./pages/ContactUs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import HelpCenter from "./pages/HelpCenter";
import FAQ from "./pages/FAQ";
import AIEducationFuture from "./pages/blog/AIEducationFuture";
import LearningStrategies from "./pages/blog/LearningStrategies";
import GamificationLearning from "./pages/blog/GamificationLearning";
import TimeManagement from "./pages/blog/TimeManagement";
import SpacedRepetition from "./pages/blog/SpacedRepetition";
import LearningHabits from "./pages/blog/LearningHabits";
import AIvsTraditionalTutoring from "./pages/blog/AIvsTraditionalTutoring";

const queryClient = new QueryClient();

const AppLayout = () => {
  const location = useLocation();
  const hideFooter = location.pathname === "/chat";

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <main className="flex-1">
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
                <Route path="/learn" element={<ProtectedRoute><Lesson /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                
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
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
