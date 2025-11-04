'use client';

import AuthStatus from '@/components/auth-status';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome to DayFlow Calendar
          </h1>
          <p className="mt-2 text-muted-foreground">
            Sign in to manage your schedule.
          </p>
        </div>
        <AuthStatus />
      </div>
    </div>
  );
}
