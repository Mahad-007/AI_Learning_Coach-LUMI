import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Award, BarChart3, Settings, LogOut, Mail, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Profile Header */}
        <Card className="p-8 mb-8 bg-gradient-hero">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="w-32 h-32 border-4 border-primary">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold mb-2">{user.name}</h1>
              <p className="text-muted-foreground mb-4 flex items-center gap-2 justify-center md:justify-start">
                <Mail className="w-4 h-4" />
                {user.email}
              </p>
              
              <div className="flex gap-4 justify-center md:justify-start">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{user.level}</p>
                  <p className="text-sm text-muted-foreground">Level</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{user.xp}</p>
                  <p className="text-sm text-muted-foreground">Total XP</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">12</p>
                  <p className="text-sm text-muted-foreground">Achievements</p>
                </div>
              </div>
            </div>

            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </Card>

        {/* Profile Tabs */}
        <Tabs defaultValue="stats" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="stats">
              <BarChart3 className="w-4 h-4 mr-2" />
              Stats
            </TabsTrigger>
            <TabsTrigger value="achievements">
              <Award className="w-4 h-4 mr-2" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="leaderboard">
              <Trophy className="w-4 h-4 mr-2" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stats">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Learning Streak</h3>
                <p className="text-4xl font-bold text-primary mb-2">7 🔥</p>
                <p className="text-sm text-muted-foreground">Days in a row</p>
              </Card>
              
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Lessons Completed</h3>
                <p className="text-4xl font-bold text-primary mb-2">28</p>
                <p className="text-sm text-muted-foreground">Across 5 subjects</p>
              </Card>
              
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Quiz Average</h3>
                <p className="text-4xl font-bold text-primary mb-2">87%</p>
                <p className="text-sm text-muted-foreground">Great progress!</p>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="achievements">
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: "First Steps", desc: "Complete your first lesson", unlocked: true },
                { name: "Quiz Master", desc: "Score 100% on a quiz", unlocked: true },
                { name: "Week Warrior", desc: "7 day streak", unlocked: true },
                { name: "Knowledge Seeker", desc: "Complete 50 lessons", unlocked: false },
                { name: "Perfect Score", desc: "Get 100% on 10 quizzes", unlocked: false },
                { name: "Month Master", desc: "30 day streak", unlocked: false },
              ].map((achievement, i) => (
                <Card key={i} className={`p-6 ${!achievement.unlocked && "opacity-50"}`}>
                  <Award className={`w-12 h-12 mb-4 ${achievement.unlocked ? "text-primary" : "text-muted-foreground"}`} />
                  <h3 className="font-semibold mb-2">{achievement.name}</h3>
                  <p className="text-sm text-muted-foreground">{achievement.desc}</p>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="leaderboard">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Your Ranking</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold">#12</span>
                    <Avatar>
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{user.name} (You)</p>
                      <p className="text-sm text-muted-foreground">{user.role}</p>
                    </div>
                  </div>
                  <span className="font-bold text-primary">{user.xp} XP</span>
                </div>
                
                <Button className="w-full" variant="outline" onClick={() => navigate("/leaderboard")}>
                  View Full Leaderboard
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-6">Account Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Full Name</label>
                  <p className="text-muted-foreground">{user.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Role</label>
                  <p className="text-muted-foreground capitalize">{user.role}</p>
                </div>
                <Button variant="outline" className="mt-4">
                  <User className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
