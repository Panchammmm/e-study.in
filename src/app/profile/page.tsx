'use client';
import React from 'react';
import { useAuth } from '@/hooks/useApiAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { UserCircle, Mail, Shield, ArrowLeft, Phone, Calendar, CheckCircle, XCircle, FileText } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();
  const router = useRouter();

  // Get user initials for the avatar fallback
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => user.role === 'ADMIN' ? router.push('/admin/dashboard') : router.push('/student/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <h1 className="text-3xl font-bold mb-8">User Profile</h1>
        
        <Card className="mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-start gap-8">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-32 w-32">
                <AvatarImage src={user?.profileImage || "/placeholder.svg"} alt={user?.name || "User"} />
                <AvatarFallback className="bg-primary text-primary-foreground text-4xl">
                  {getInitials(user?.name)}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline">Change Photo</Button>
            </div>
            
            <div className="space-y-6 flex-1">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center">
                  <UserCircle className="mr-2 h-4 w-4" />
                  Full Name
                </p>
                <p className="text-lg font-medium">{user.name || 'Not provided'}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center">
                  <Mail className="mr-2 h-4 w-4" />
                  Email Address
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-medium">{user.email || 'Not provided'}</p>
                  {user.isEmailVerified ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    {user.isEmailVerified ? 'Verified' : 'Not verified'}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center">
                  <Phone className="mr-2 h-4 w-4" />
                  Phone Number
                </p>
                <p className="text-lg font-medium">{user.phoneNumber || 'Not provided'}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center">
                  <Shield className="mr-2 h-4 w-4" />
                  Role
                </p>
                <p className="text-lg font-medium capitalize">{user.role || 'User'}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  Bio
                </p>
                <p className="text-lg font-medium">{user.bio || 'No bio available'}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Member Since
                </p>
                <p className="text-lg font-medium">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Unknown'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Account Created</p>
                <p className="text-lg font-medium">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'Unknown'}
                </p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="text-lg font-medium">
                  {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'Unknown'}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">User ID</p>
                <p className="text-sm font-mono bg-gray-100 p-2 rounded break-all">
                  {user.id || 'Unknown'}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Email Status</p>
                <div className="flex items-center gap-2">
                  {user.isEmailVerified ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-green-600 font-medium">Verified</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-red-600 font-medium">Not Verified</span>
                      <Button variant="link" className="text-blue-600 p-0 h-auto">
                        Verify Now
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end mt-8">
          <Button>Edit Profile</Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
