import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useEffect } from 'react';
import { useUIStore } from '../store/uiStore';
import { Toaster } from '../components/ui/Toast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => {
  const { theme } = useUIStore();

  // Sync theme on mount
  useEffect(() => {
    const root = document.documentElement;
    const resolved = theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      : theme;
    root.classList.remove('light', 'dark');
    root.classList.add(resolved);
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster />
      {(import.meta as ImportMeta & { env?: Record<string, string | boolean | undefined> }).env?.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};
