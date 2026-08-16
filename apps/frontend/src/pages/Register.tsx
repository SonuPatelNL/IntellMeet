import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from '@/components/ui/Toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const tempErrors: { name?: string; email?: string; password?: string; confirmPassword?: string } = {};
    if (!name) tempErrors.name = 'Name is required';
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
    if (password !== confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await register(name, email, password);
      toast({
        title: 'Account Created',
        description: 'Welcome to IntellMeet! Your account is ready.',
        variant: 'success',
      });
      navigate('/dashboard');
    } catch (err: any) {
      toast({
        title: 'Registration Failed',
        description: err.response?.data?.message || 'Something went wrong. Please try again.',
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">
            Create account
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Join IntellMeet to start hosting AI-powered meetings
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              className="bg-slate-950/60 border-slate-800 text-white placeholder-slate-500 focus:border-primary"
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              className="bg-slate-950/60 border-slate-800 text-white placeholder-slate-500 focus:border-primary"
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              className="bg-slate-950/60 border-slate-800 text-white placeholder-slate-500 focus:border-primary"
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              className="bg-slate-950/60 border-slate-800 text-white placeholder-slate-500 focus:border-primary"
            />
          </div>

          <Button
            type="submit"
            loading={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-white transition-all py-2.5 rounded-lg"
          >
            Sign up
          </Button>
        </form>

        <div className="text-center text-sm text-slate-400 mt-4">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
