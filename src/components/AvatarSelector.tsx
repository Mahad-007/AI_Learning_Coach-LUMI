import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Check } from "lucide-react";
import { useState } from "react";

// 10 diverse, theme-matching avatars (5 male, 5 female)
export const AVATAR_OPTIONS = [
  // Female avatars
  {
    id: "avatar-1",
    url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Luna&backgroundColor=c0aede&hair=long01&hairColor=4a5568",
    name: "Luna Scholar",
    gender: "female"
  },
  {
    id: "avatar-2",
    url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Sophie&backgroundColor=ffd5dc&hair=long02&hairColor=724133",
    name: "Sophie Bright",
    gender: "female"
  },
  {
    id: "avatar-3",
    url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Emma&backgroundColor=b6e3f4&hair=long03&hairColor=0a5c78",
    name: "Emma Wisdom",
    gender: "female"
  },
  {
    id: "avatar-4",
    url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Aria&backgroundColor=d1f4e0&hair=long04&hairColor=3c4f3d",
    name: "Aria Green",
    gender: "female"
  },
  {
    id: "avatar-5",
    url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Maya&backgroundColor=ffe4b3&hair=long05&hairColor=724133",
    name: "Maya Joy",
    gender: "female"
  },
  // Male avatars
  {
    id: "avatar-6",
    url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=b6e3f4&hair=short01&hairColor=0a5c78",
    name: "Felix Explorer",
    gender: "male"
  },
  {
    id: "avatar-7",
    url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Max&backgroundColor=d1f4e0&hair=short02&hairColor=3c4f3d",
    name: "Max Nature",
    gender: "male"
  },
  {
    id: "avatar-8",
    url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Leo&backgroundColor=ffdfbf&hair=short03&hairColor=724133",
    name: "Leo Star",
    gender: "male"
  },
  {
    id: "avatar-9",
    url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Oliver&backgroundColor=c0aede&hair=short04&hairColor=4a5568",
    name: "Oliver Sage",
    gender: "male"
  },
  {
    id: "avatar-10",
    url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Kai&backgroundColor=ffd5dc&hair=short05&hairColor=6b4e71",
    name: "Kai Creative",
    gender: "male"
  },
];

interface AvatarSelectorProps {
  open: boolean;
  onClose: () => void;
  currentAvatar?: string;
  onSelect: (avatarUrl: string) => void;
}

export function AvatarSelector({ open, onClose, currentAvatar, onSelect }: AvatarSelectorProps) {
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);
  const [isSelecting, setIsSelecting] = useState(false);

  const handleSelect = async (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
    setIsSelecting(true);
    
    try {
      await onSelect(avatarUrl);
      setTimeout(() => {
        onClose();
        setIsSelecting(false);
      }, 300);
    } catch (error) {
      setIsSelecting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Choose Your Avatar
          </DialogTitle>
          <DialogDescription className="text-base">
            Select an avatar that represents your learning journey 🎓
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 py-6">
          {AVATAR_OPTIONS.map((avatar) => {
            const isSelected = selectedAvatar === avatar.url;
            
            return (
              <button
                key={avatar.id}
                onClick={() => handleSelect(avatar.url)}
                disabled={isSelecting}
                className={`flex flex-col items-center gap-3 p-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                  isSelected 
                    ? "bg-gradient-to-br from-primary/20 to-secondary/20 ring-2 ring-primary shadow-glow" 
                    : "bg-card hover:bg-accent/50"
                } ${isSelecting ? "opacity-50 cursor-wait" : ""}`}
              >
                <div className="relative">
                  <Avatar className="w-20 h-20 border-2 border-primary/20 transition-all duration-300">
                    <AvatarImage src={avatar.url} alt={avatar.name} />
                    <AvatarFallback>{avatar.name[0]}</AvatarFallback>
                  </Avatar>
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 bg-gradient-to-br from-primary to-secondary rounded-full p-1.5 shadow-lg animate-in zoom-in duration-300">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <span className="text-xs font-medium text-center leading-tight">
                  {avatar.name}
                </span>
              </button>
            );
          })}
        </div>
        
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isSelecting}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
