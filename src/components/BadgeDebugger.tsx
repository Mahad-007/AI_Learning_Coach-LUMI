import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { getAllAchievements } from "@/services/achievementsRegistry";

export function BadgeDebugger() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [mismatchInfo, setMismatchInfo] = useState<{
    dbBadges: string[];
    registryNames: string[];
    matched: string[];
    unmatched: string[];
  } | null>(null);

  const analyzeBadges = async () => {
    if (!user) return;
    
    setLoading(true);
    console.log("[BadgeDebugger] Analyzing badge name matching...");

    try {
      // Get badges from database
      const { data: badges, error } = await supabase
        .from('badges')
        .select('badge_name')
        .eq('user_id', user.id);

      if (error) {
        console.error("[BadgeDebugger] Error fetching badges:", error);
        toast.error(`Error: ${error.message}`);
        setLoading(false);
        return;
      }

      // Get achievement names from registry
      const allAchievements = getAllAchievements();
      const registryNames = allAchievements.map(a => a.name);
      const dbBadgeNames = (badges || []).map(b => b.badge_name);

      // Find matches and mismatches
      const matched: string[] = [];
      const unmatched: string[] = [];

      dbBadgeNames.forEach(dbName => {
        const normalizedDb = dbName.toLowerCase().trim();
        const found = registryNames.find(regName => 
          regName.toLowerCase().trim() === normalizedDb
        );
        
        if (found) {
          matched.push(dbName);
        } else {
          unmatched.push(dbName);
        }
      });

      setMismatchInfo({
        dbBadges: dbBadgeNames,
        registryNames,
        matched,
        unmatched,
      });

      console.log("[BadgeDebugger] Analysis complete:");
      console.log("  DB Badges:", dbBadgeNames);
      console.log("  Matched:", matched);
      console.log("  Unmatched:", unmatched);

      if (unmatched.length > 0) {
        toast.warning(`Found ${unmatched.length} badge(s) that don't match the registry!`);
      } else {
        toast.success(`All ${matched.length} badges match perfectly!`);
      }

    } catch (err) {
      console.error("[BadgeDebugger] Error:", err);
      toast.error("Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  // Auto-analyze on mount
  useEffect(() => {
    if (user) {
      analyzeBadges();
    }
  }, [user]);

  if (!user) return null;

  return (
    <Card className="p-4 border-2 border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
      <div className="space-y-3">
        <div>
          <h3 className="font-bold text-yellow-900 dark:text-yellow-100 flex items-center gap-2">
            🔧 Achievement Debug Tool
            <Button 
              onClick={analyzeBadges} 
              disabled={loading}
              variant="ghost"
              size="sm"
            >
              {loading ? "Analyzing..." : "🔄 Refresh"}
            </Button>
          </h3>
        </div>

        {mismatchInfo && (
          <div className="space-y-3 text-sm">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded">
                <div className="font-bold text-lg">{mismatchInfo.dbBadges.length}</div>
                <div className="text-xs">In Database</div>
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-2 rounded">
                <div className="font-bold text-lg">{mismatchInfo.matched.length}</div>
                <div className="text-xs">Matched ✓</div>
              </div>
              <div className="bg-red-100 dark:bg-red-900 p-2 rounded">
                <div className="font-bold text-lg">{mismatchInfo.unmatched.length}</div>
                <div className="text-xs">Unmatched ✗</div>
              </div>
            </div>

            {/* Matched Badges */}
            {mismatchInfo.matched.length > 0 && (
              <div className="bg-green-50 dark:bg-green-950 p-2 rounded">
                <div className="font-semibold text-green-800 dark:text-green-200 mb-1">
                  ✓ Matched ({mismatchInfo.matched.length}):
                </div>
                <div className="text-xs text-green-700 dark:text-green-300 space-y-0.5">
                  {mismatchInfo.matched.map((name, i) => (
                    <div key={i}>• {name}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Unmatched Badges */}
            {mismatchInfo.unmatched.length > 0 && (
              <div className="bg-red-50 dark:bg-red-950 p-2 rounded">
                <div className="font-semibold text-red-800 dark:text-red-200 mb-1">
                  ✗ Unmatched - These won't show in UI ({mismatchInfo.unmatched.length}):
                </div>
                <div className="text-xs text-red-700 dark:text-red-300 space-y-1">
                  {mismatchInfo.unmatched.map((name, i) => {
                    // Find closest match
                    const closest = mismatchInfo.registryNames.find(regName =>
                      regName.toLowerCase().includes(name.toLowerCase().substring(0, 5))
                    );
                    return (
                      <div key={i} className="border-l-2 border-red-400 pl-2">
                        <div>• "{name}"</div>
                        {closest && (
                          <div className="text-xs opacity-75">
                            → Did you mean: "{closest}"?
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Instructions */}
            {mismatchInfo.unmatched.length > 0 && (
              <div className="bg-yellow-100 dark:bg-yellow-900 p-2 rounded text-xs">
                <div className="font-semibold mb-1">🔧 How to Fix:</div>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Open Supabase Dashboard → Table Editor → badges</li>
                  <li>Find the unmatched badge rows</li>
                  <li>Edit the badge_name to match the registry name exactly</li>
                  <li>Refresh this page to verify</li>
                </ol>
              </div>
            )}
          </div>
        )}

        {/* Console Logs Reminder */}
        <div className="text-xs text-yellow-700 dark:text-yellow-400 border-t border-yellow-300 pt-2">
          💡 Check browser console for detailed badge matching logs
        </div>
      </div>
    </Card>
  );
}
