import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Brain, Home, BookOpen, Trophy, BarChart3, Users, User, DollarSign, Sparkles, MessageSquare, Zap, PenTool, ChevronDown, Sun, Moon } from "lucide-react";
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
import { NotificationsService } from '@/services/notificationsService';
import { useAuth } from "@/contexts/AuthContext";
import { FriendsDrawer } from '@/components/learn/FriendsDrawer';

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
  const [isDark, setIsDark] = useState(false);
  const location = useLocation();
  const [notifs, setNotifs] = useState<any[]>([]);
  // Load notifications (simple polling for now)
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const list = await NotificationsService.list(10);
        if (mounted) setNotifs(list);
      } catch {}
    };
    load();
    const id = setInterval(load, 8000);
    return () => { mounted = false; clearInterval(id); };
  }, []);
  const { isAuthenticated, user, logout } = useAuth();
  const [friendsOpen, setFriendsOpen] = useState(false);
  
  const navLinks = isAuthenticated ? authenticatedNavLinks : publicNavLinks;

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = stored ? stored === 'dark' : prefersDark;
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* BETA Label */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-1.5 sm:px-2 py-1 rounded-md shadow-sm">
              BETA
            </div>
            {/* Logo */}
            <Link to="/" className="flex items-center gap-1 sm:gap-2 group">
              <img src="/logo.png" alt="Lumi Logo" className="w-12 h-12 sm:w-16 sm:h-16" />
              <span className="text-lg sm:text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Lumi
              </span>
            </Link>
          </div>

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
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <span className="sr-only">Notifications</span>
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-[10px] text-white flex items-center justify-center">
                    {notifs.filter(n => !n.read_at).length}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a6 6 0 00-6 6v3.586l-1.707 1.707A1 1 0 005 15h14a1 1 0 00.707-1.707L18 11.586V8a6 6 0 00-6-6zm0 20a3 3 0 01-3-3h6a3 3 0 01-3 3z"/></svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="px-3 py-2 text-sm font-medium">Notifications</div>
                {notifs.length === 0 && (
                  <div className="px-3 py-6 text-center text-sm text-muted-foreground">No notifications</div>
                )}
                {notifs.map((n) => (
                  <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1">
                    <div className="text-sm font-medium capitalize">{n.type.replace('_',' ')}</div>
                    <div className="text-xs text-muted-foreground break-words w-full">{n.payload && (n.payload.message || n.payload.room_code || n.payload.from_name)}</div>
                    <div className="text-[10px] text-muted-foreground">{new Date(n.created_at).toLocaleString()}</div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme toggle */}
            <Button variant="ghost" size="icon" className="ml-1" onClick={toggleTheme} aria-label="Toggle theme">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
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
                  <DropdownMenuItem onClick={() => setFriendsOpen(true)} className="cursor-pointer">
                    <Users className="w-4 h-4 mr-2" />
                    My Friends
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

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-1">
            {/* Notifications for mobile */}
            {isAuthenticated && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <span className="sr-only">Notifications</span>
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-[10px] text-white flex items-center justify-center">
                      {notifs.filter(n => !n.read_at).length}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a6 6 0 00-6 6v3.586l-1.707 1.707A1 1 0 005 15h14a1 1 0 00.707-1.707L18 11.586V8a6 6 0 00-6-6zm0 20a3 3 0 01-3-3h6a3 3 0 01-3 3z"/></svg>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="px-3 py-2 text-sm font-medium">Notifications</div>
                  {notifs.length === 0 && (
                    <div className="px-3 py-6 text-center text-sm text-muted-foreground">No notifications</div>
                  )}
                  {notifs.slice(0, 3).map((n) => (
                    <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1">
                      <div className="text-sm font-medium capitalize">{n.type.replace('_',' ')}</div>
                      <div className="text-xs text-muted-foreground break-words w-full">{n.payload && (n.payload.message || n.payload.room_code || n.payload.from_name)}</div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
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
      <FriendsDrawer isOpen={friendsOpen} onClose={() => setFriendsOpen(false)} />
    </nav>
  );
};
