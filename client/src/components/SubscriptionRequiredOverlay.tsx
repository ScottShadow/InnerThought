import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface SubscriptionRequiredOverlayProps {
  isSubscribed: boolean;
}

export default function SubscriptionRequiredOverlay({ isSubscribed }: SubscriptionRequiredOverlayProps) {
  if (isSubscribed) {
    return null;
  }

  return (
    <div className="absolute inset-0 backdrop-blur-md bg-white/50 flex flex-col items-center justify-center p-6 z-50">
      <div className="max-w-md mx-auto text-center space-y-4">
        <h3 className="text-2xl font-bold">Premium Feature</h3>
        <p className="text-lg">
          Unlock detailed insights and pattern analysis with a one-time $3 payment.
        </p>
        <Link href="/subscribe">
          <Button size="lg" className="mt-4">
            Unlock Premium Features
          </Button>
        </Link>
      </div>
    </div>
  );
}