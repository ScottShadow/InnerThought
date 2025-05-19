import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "@/lib/queryClient";

export default function SubscriptionSuccess() {
  const [, navigate] = useLocation();

  // Invalidate the subscription status query to refresh it
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["/api/subscriptions/status"] });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Thank You!</CardTitle>
          <CardDescription className="text-center">
            Your payment was successful.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <svg
                className="h-8 w-8 text-green-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-lg font-medium">Premium Features Unlocked!</p>
            <p className="text-gray-500 mt-2">
              You now have lifetime access to all premium features including Theme Pattern Analysis.
            </p>
          </div>
          
          <div className="flex flex-col space-y-3">
            <Button onClick={() => navigate("/insights")} className="w-full">
              Explore My Insights
            </Button>
            <Button variant="outline" onClick={() => navigate("/")} className="w-full">
              Return to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}