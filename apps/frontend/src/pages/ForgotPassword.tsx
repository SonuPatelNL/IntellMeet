import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '@/services/auth.api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from '@/components/ui/Toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = () => {
    if (!email) {
      setError('Email is required');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email is invalid');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await authApi.forgotPassword(email);
      setIsSubmitted(true);
      toast({
        title: 'Email Sent',
        description: 'If an account exists for that email, we have sent password reset instructions.',
        variant: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">
            Forgot password?
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            No worries, we'll send you reset instructions.
          </p>
        </div>

        {!isSubmitted ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error}
              className="bg-slate-950/60 border-slate-800 text-white placeholder-slate-500 focus:border-primary"
            />

            <Button
              type="submit"
              loading={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-white transition-all py-2.5 rounded-lg"
            >
              Reset password
            </Button>
          </form>
        ) : (
          <div className="mt-8 text-center space-y-6">
            <p className="text-slate-300">
              We've sent a link to <span className="font-semibold text-white">{email}</span>. Please check your inbox and spam folder.
            </p>
            <Button
              onClick={() => setIsSubmitted(false)}
              variant="outline"
              className="w-full border-slate-800 text-slate-300 hover:text-white"
            >
              Try another email
            </Button>
          </div>
        )}

        <div className="text-center text-sm text-slate-400 mt-4">
          <Link
            to="/login"
            className="font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
