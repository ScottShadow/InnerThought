import { Switch, Route, useLocation } from "wouter";
import { queryClient, getQueryFn } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import AllEntries from "@/pages/AllEntries";
import Insights from "@/pages/Insights";
import EntryDetail from "@/pages/EntryDetail";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Subscribe from "@/pages/Subscribe";
import SubscriptionSuccess from "@/pages/SubscriptionSuccess";
import { useEffect } from "react";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const [, navigate] = useLocation();
  
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/landing");
    }
  }, [user, isLoading, navigate]);
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  return user ? <>{children}</> : null;
}

function Router() {
  return (
    <Switch>
      <Route path="/landing" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/subscribe" component={Subscribe} />
      <Route path="/subscription-success" component={SubscriptionSuccess} />
      <Route path="/">
        <AuthGuard>
          <Home />
        </AuthGuard>
      </Route>
      <Route path="/entries">
        <AuthGuard>
          <AllEntries />
        </AuthGuard>
      </Route>
      <Route path="/entries/:id">
        {(params) => (
          <AuthGuard>
            <EntryDetail />
          </AuthGuard>
        )}
      </Route>
      <Route path="/insights">
        <AuthGuard>
          <Insights />
        </AuthGuard>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
