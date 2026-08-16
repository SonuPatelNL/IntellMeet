import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { authApi } from '@/services/auth.api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from '@/components/ui/Toast';

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const tempErrors: { password?: string; confirmPassword?: string } = {};
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
    if (!token) {
      toast({
        title: 'Error',
        description: 'Reset token is missing or invalid.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword(password, token);
      toast({
        title: 'Password Reset Successful',
        description: 'Your password has been successfully updated. You can now log in.',
        variant: 'success',
      });
      navigate('/login');
    } catch (err: any) {
      toast({
        title: 'Reset Failed',
        description: err.response?.data?.message || 'Token is invalid or has expired.',
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m-5 4h5M9 21h6a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">
            Reset password
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Enter your new password below.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              className="bg-slate-950/60 border-slate-800 text-white placeholder-slate-500 focus:border-primary"
            />
            <Input
              label="Confirm New Password"
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
            Update password
          </Button>
        </form>

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
