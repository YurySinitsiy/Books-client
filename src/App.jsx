import Books from "./Books"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function App() {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <Books />
    </QueryClientProvider>

  )
};
export default App
