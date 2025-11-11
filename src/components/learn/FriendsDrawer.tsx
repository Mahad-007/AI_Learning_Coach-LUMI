import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X, Users as UsersIcon } from 'lucide-react';
import { FriendsService } from '@/services/friendsService';
import { ProfilePreview } from '@/components/ProfilePreview';

interface FriendsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FriendsDrawer({ isOpen, onClose }: FriendsDrawerProps) {
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const list = await FriendsService.listFriends();
      setFriends(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) load();
  }, [isOpen]);

  const unfriend = async (friendId: string) => {
    await FriendsService.unfriend(friendId);
    await load();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed right-0 top-16 bottom-0 w-full sm:w-[460px] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-l shadow-2xl z-50"
          >
            <div className="flex flex-col h-full">
              <div className="px-5 py-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UsersIcon className="w-5 h-5 text-primary" />
                  <h2 className="font-semibold text-lg">My Friends</h2>
                </div>
                <Button size="icon" variant="ghost" onClick={onClose} aria-label="Close">
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-4">
                  {loading ? (
                    <div className="text-sm text-muted-foreground">Loading...</div>
                  ) : friends.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="w-12 h-12 rounded-full bg-muted mx-auto flex items-center justify-center mb-3">
                        <UsersIcon className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">No friends yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {friends.map((f) => (
                        <Card key={f.id} className="p-3 flex items-center justify-between hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setSelectedProfile(f.id)}>
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="w-9 h-9">
                                <AvatarImage src={f.avatar_url} alt={f.name} />
                                <AvatarFallback>{(f.name || 'U').charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className={`absolute -bottom-0 -right-0 w-3 h-3 rounded-full border border-background ${f.status === 'online' ? 'bg-emerald-500' : 'bg-zinc-500'}`}></span>
                            </div>
                            <div>
                              <div className="font-medium leading-none">{f.name}</div>
                              <div className="text-xs text-muted-foreground">@{f.username || 'user'}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant={f.status === 'online' ? 'default' : 'secondary'}>{f.status || 'offline'}</Badge>
                            <Button size="sm" variant="outline" className="text-destructive border-destructive/40" onClick={(e) => {
                              e.stopPropagation();
                              unfriend(f.id);
                            }}>Unfriend</Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="p-4 border-t bg-background/60">
                <Button variant="outline" className="w-full" onClick={onClose}>Close</Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
      
      {/* Profile Preview */}
      <ProfilePreview
        userId={selectedProfile || ''}
        isOpen={!!selectedProfile}
        onClose={() => setSelectedProfile(null)}
        onUnfriend={(userId) => {
          unfriend(userId);
          setSelectedProfile(null);
        }}
      />
    </AnimatePresence>
  );
}
