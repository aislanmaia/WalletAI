import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import TransactionsPage from "@/pages/transactions";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";
import AppLayout from "@/layouts/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";

function ProtectedRoutes() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/transactions" component={TransactionsPage} />
          <Route component={NotFound} />
        </Switch>
      </AppLayout>
    </ProtectedRoute>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route component={ProtectedRoutes} />
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
