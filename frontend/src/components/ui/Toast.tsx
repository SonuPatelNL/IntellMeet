import * as React from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { create } from 'zustand';

// ─── Toast Store ────────────────────────────────────────────────────
interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
}

interface ToastStore {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
}

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) =>
    set((s) => ({ toasts: [...s.toasts, { ...toast, id: crypto.randomUUID() }] })),
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = (payload: Omit<ToastItem, 'id'>) => {
  useToastStore.getState().addToast(payload);
};

// ─── Toast Components ───────────────────────────────────────────────
const ToastProvider = ToastPrimitives.Provider;
const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn('fixed bottom-4 right-4 z-[100] flex max-h-screen w-full max-w-[380px] flex-col gap-2', className)}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const variantStyles: Record<string, string> = {
  default: 'border-border bg-card text-card-foreground',
  destructive: 'border-destructive bg-destructive text-destructive-foreground',
  success: 'border-green-500/50 bg-green-950 text-green-100',
};

export const Toaster = () => {
  const { toasts, removeToast } = useToastStore();
  return (
    <ToastProvider swipeDirection="right">
      {toasts.map(({ id, title, description, variant = 'default' }) => (
        <ToastPrimitives.Root
          key={id}
          open
          onOpenChange={(open) => !open && removeToast(id)}
          duration={4000}
          className={cn(
            'group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-xl border p-4 pr-8 shadow-lg',
            'transition-all duration-300 animate-fade-in',
            variantStyles[variant]
          )}
        >
          <div className="flex flex-col gap-1">
            <ToastPrimitives.Title className="text-sm font-semibold">{title}</ToastPrimitives.Title>
            {description && (
              <ToastPrimitives.Description className="text-xs opacity-80">{description}</ToastPrimitives.Description>
            )}
          </div>
          <ToastPrimitives.Close
            onClick={() => removeToast(id)}
            className="absolute right-2 top-2 opacity-60 hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </ToastPrimitives.Close>
        </ToastPrimitives.Root>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
};
