import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function ResetSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-10">
      <Card className="w-full max-w-md p-6 text-center">
        <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto mb-3" />
        <h1 className="text-2xl font-bold mb-2">Password updated!</h1>
        <p className="text-sm text-muted-foreground mb-6">You can now sign in with your new password.</p>
        <Button asChild>
          <Link to="/login">Go to Login</Link>
        </Button>
      </Card>
    </div>
  );
}


