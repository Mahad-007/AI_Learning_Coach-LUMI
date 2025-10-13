import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Brain, Home, BookOpen, Trophy, BarChart3, Users, User, DollarSign, Sparkles, MessageSquare, Zap, PenTool, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const publicNavLinks = [
  { name: "Home", path: "/", icon: Home, type: "link" },
  { name: "Features", path: "/#features", icon: Sparkles, type: "link" },
  { name: "Pricing", path: "/#pricing", icon: DollarSign, type: "link" },
];

const authenticatedNavLinks = [
  { name: "Dashboard", path: "/dashboard", icon: BarChart3, type: "link" },
  { name: "AI Chat", path: "/chat", icon: MessageSquare, type: "link" },
  { 
    name: "Learn", 
    icon: BookOpen, 
    type: "dropdown",
    items: [
      { name: "Learn", path: "/learn", icon: BookOpen },
      { name: "Whiteboard", path: "/whiteboard", icon: PenTool },
    ]
  },
  { 
    name: "Quiz", 
    icon: Brain, 
    type: "dropdown",
    items: [
      { name: "Quizzes", path: "/quiz", icon: Brain },
      { name: "Trivia Battle", path: "/trivia", icon: Zap },
    ]
  },
  { name: "Leaderboard", path: "/leaderboard", icon: Trophy, type: "link" },
  { name: "Friends", path: "/friends", icon: Users, type: "link" },
];

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  
  const navLinks = isAuthenticated ? authenticatedNavLinks : publicNavLinks;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-gradient-primary rounded-lg shadow-md group-hover:shadow-glow transition-all duration-300">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              AI Learning Coach
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link: any, index) => {
              const Icon = link.icon;
              
              if (link.type === "dropdown") {
                const isActive = link.items.some((item: any) => location.pathname === item.path);
                
                return (
                  <div key={index} className="relative group">
                    <button
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300",
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{link.name}</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    
                    {/* Dropdown Content */}
                    <div className="absolute left-0 top-full mt-2 w-[200px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="bg-card border border-border rounded-lg shadow-lg p-2 space-y-1">
                        {link.items.map((item: any) => {
                          const ItemIcon = item.icon;
                          const itemIsActive = location.pathname === item.path;
                          return (
                            <Link
                              key={item.path}
                              to={item.path}
                              className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm",
                                itemIsActive
                                  ? "bg-primary/10 text-primary font-medium"
                                  : "hover:bg-muted text-foreground"
                              )}
                            >
                              <ItemIcon className="w-5 h-5" />
                              <span>{item.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              }
              
              // Regular link
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">Level {user.level}</p>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/leaderboard" className="cursor-pointer">
                      <Trophy className="w-4 h-4 mr-2" />
                      Leaderboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button variant="hero" asChild>
                  <Link to="/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-card border-t border-border animate-slide-up">
          <div className="container mx-auto px-4 py-4 space-y-2">
            {navLinks.map((link: any, index) => {
              const Icon = link.icon;
              
              if (link.type === "dropdown") {
                return (
                  <div key={index} className="space-y-1">
                    <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">
                      {link.name}
                    </div>
                    {link.items.map((item: any) => {
                      const ItemIcon = item.icon;
                      const isActive = location.pathname === item.path;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-6 py-3 rounded-lg transition-all duration-300",
                            isActive
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          )}
                        >
                          <ItemIcon className="w-5 h-5" />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                );
              }
              
              // Regular link
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
            <div className="pt-4 space-y-2 border-t border-border">
              {isAuthenticated && user ? (
                <>
                  <Link to="/profile" onClick={() => setIsOpen(false)}>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">View Profile</p>
                      </div>
                    </div>
                  </Link>
                  <Button variant="outline" className="w-full" onClick={logout}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button variant="hero" className="w-full" asChild>
                    <Link to="/signup">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
