'use client';

import { useAuth, useUser } from '@/firebase';
import {
  initiateAnonymousSignIn,
  initiateEmailSignIn,
} from '@/firebase/non-blocking-login';
import { Button } from './ui/button';
import { signOut } from 'firebase/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export default function AuthStatus() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAnonymousSignIn = () => {
    initiateAnonymousSignIn(auth);
  };

  const handleEmailSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    initiateEmailSignIn(auth, email, password);
  };

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
    }
  };

  if (isUserLoading) {
    return <div>Loading...</div>;
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <p>Welcome, {user.email || 'Anonymous User'}</p>
        <Button onClick={handleSignOut} variant="outline">
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <Tabs defaultValue="signin" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="signin">Sign In</TabsTrigger>
        <TabsTrigger value="anonymous">Guest</TabsTrigger>
      </TabsList>
      <TabsContent value="signin">
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your calendar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="anonymous">
        <Card>
          <CardHeader>
            <CardTitle>Continue as Guest</CardTitle>
            <CardDescription>
              Your session will be temporary. Sign up to save your data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleAnonymousSignIn} className="w-full">
              Sign In Anonymously
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
