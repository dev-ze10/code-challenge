import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { SwapForm } from "./components/SwapForm";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen items-center justify-center bg-[#0d0b14] px-4">
        <SwapForm />
      </div>
      <Toaster theme="dark" position="bottom-center" richColors />
    </QueryClientProvider>
  );
}

export default App;
