import { Card } from "@/components/ui/card";
import { useEffect } from "react";
import ProgressCalendarGraph from "@/components/ProgressCalendarGraph";

export default function ProgressCalendar() {
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Progress Calendar</h1>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
            Track your learning journey with daily activity visualization
          </p>
        </div>
        
        {/* Constrain calendar width to keep it compact */}
        <div className="mx-auto w-full max-w-md sm:max-w-lg">
          <ProgressCalendarGraph className="w-full" />
        </div>
      </div>
    </div>
  );
}


