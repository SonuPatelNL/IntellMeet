import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from '@/components/ui/Toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const tempErrors: { email?: string; password?: string } = {};
    if (!email) {
      tempErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Email is invalid';
    }
    if (!password) {
      tempErrors.password = 'Password is required';
    } else if (password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await login(email, password);
      toast({
        title: 'Welcome Back!',
        description: 'Successfully logged in to IntellMeet.',
        variant: 'success',
      });
      navigate('/dashboard');
    } catch (err: any) {
      toast({
        title: 'Login Failed',
        description: err.response?.data?.message || 'Invalid credentials. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 sm:px-6 lg:px-8">
      {/* Background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] left-[20%] w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute -bottom-[30%] right-[10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-8 bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to manage and collaborate on meetings
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              className="bg-slate-950/60 border-slate-800 text-white placeholder-slate-500 focus:border-primary"
            />
            <div className="space-y-1">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                className="bg-slate-950/60 border-slate-800 text-white placeholder-slate-500 focus:border-primary"
              />
              <div className="flex items-center justify-end text-xs">
                <Link
                  to="/forgot-password"
                  className="font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            loading={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-white transition-all py-2.5 rounded-lg"
          >
            Sign in
          </Button>
        </form>

        <div className="text-center text-sm text-slate-400 mt-4">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
