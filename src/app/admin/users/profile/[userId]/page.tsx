'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  User,
  Clock,
  Shield,
  Activity,
  ArrowLeft,
  BookOpen,
  Trophy,
  Target,
  Timer,
  TrendingUp,
  BarChart3
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  profileImage: string | null;
  isEmailVerified: boolean;
  phoneNumber: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Exam {
  id: string;
  name: string;
  description: string;
  totalMarks: number;
  timeLimit: number;
  isPublished: boolean;
}

interface Submission {
  id: string;
  examId: string;
  score: number;
  totalQuestions: number;
  totalAnswered: number;
  percentage: number;
  timeSpent: number;
  isSubmitted: boolean;
  completedAt: string;
  createdAt: string;
  exam: Exam;
}

interface SubmissionsResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      createdAt: string;
    };
    submissions: Submission[];
    statistics: unknown;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message: string;
}

interface UserProfilePageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default function UserProfilePage({ params }: UserProfilePageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setSubmissionsLoading(true);
        setError(null);

        // Fetch user data and submissions in parallel for better performance
        const [usersResponse, submissionsResponse] = await Promise.all([
          fetch('/api/users/all'),
          fetch(`/api/users/${resolvedParams.userId}/submissions?page=1&limit=10`)
        ]);

        // Handle users response
        if (!usersResponse.ok) {
          throw new Error(`HTTP error! status: ${usersResponse.status}`);
        }

        const users = await usersResponse.json();

        // Sort users by createdAt (latest first)
        const sortedUsers = users.sort(
          (a: User, b: User) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        const foundUser = sortedUsers.find((u: User) => u.id === resolvedParams.userId);

        if (!foundUser) {
          throw new Error('User not found');
        }

        setUser(foundUser);

        // Handle submissions response (don't throw error if this fails)
        if (submissionsResponse.ok) {
          try {
            const submissionsData: SubmissionsResponse = await submissionsResponse.json();
            if (submissionsData.success && submissionsData.data.submissions) {
              setSubmissions(submissionsData.data.submissions);
            }
          } catch (submissionsErr) {
            console.error('Error parsing submissions:', submissionsErr);
          }
        } else {
          console.error('Error fetching submissions:', submissionsResponse.status);
        }

      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch user data');
      } finally {
        setLoading(false);
        setSubmissionsLoading(false);
      }
    };

    if (resolvedParams.userId) {
      fetchUserData();
    }
  }, [resolvedParams.userId]);

  const formatTimeSpent = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100 border-green-200';
    if (percentage >= 60) return 'text-blue-600 bg-blue-100 border-blue-200';
    if (percentage >= 40) return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    return 'text-red-600 bg-red-100 border-red-200';
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    return 'F';
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 30) return `${diffInDays} days ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-slate-600">Loading user profile...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Profile</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => router.back()} variant="outline" className='cursor-pointer'>
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Users</span>
          </Button>
          <h1 className="text-2xl font-bold text-slate-800">User Profile</h1>
        </div>

        {/* User Header */}
        <div className="flex items-start space-x-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border bg-white/80 backdrop-blur-sm shadow-lg">
          <Avatar className="w-24 h-24 ring-4 ring-white shadow-lg">
            <AvatarImage src={user.profileImage || undefined} alt={user.name} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-2xl">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-3">
            <div className="flex items-center space-x-3">
              <h2 className="text-3xl font-bold text-slate-800">{user.name}</h2>
              <Badge
                variant={user.isEmailVerified ? "default" : "secondary"}
                className={`text-sm font-medium ${
                  user.isEmailVerified 
                    ? "bg-green-100 text-green-700 border-green-200" 
                    : "bg-orange-100 text-orange-700 border-orange-200"
                }`}
              >
                {user.isEmailVerified ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Verified
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 mr-1" />
                    Pending Verification
                  </>
                )}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4 text-slate-600">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>User ID: {user.id.slice(0, 8)}...</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Joined {getTimeSince(user.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-blue-600" />
              <span>Contact Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Email Address</p>
                  <p className="font-medium text-slate-800">{user.email}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Phone className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Phone Number</p>
                  <p className="font-medium text-slate-800">
                    {user.phoneNumber || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Details */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-purple-600" />
              <span>Account Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Account Created</p>
                  <p className="font-medium text-slate-800">{formatDate(user.createdAt)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Activity className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Last Updated</p>
                  <p className="font-medium text-slate-800">{formatDate(user.updatedAt)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exam Submissions */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <span>Exam Submissions</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {submissions.length} Total
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {submissionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-slate-600">Loading submissions...</span>
              </div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No exam submissions found</p>
                <p className="text-sm text-slate-400">This user hasn&apos;t taken any exams yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <Trophy className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-700">
                      {Math.round(submissions.reduce((acc, sub) => acc + sub.percentage, 0) / submissions.length)}%
                    </p>
                    <p className="text-sm text-blue-600">Average Score</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                    <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-700">
                      {submissions.reduce((acc, sub) => acc + sub.score, 0)}
                    </p>
                    <p className="text-sm text-green-600">Total Marks</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                    <Timer className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-700">
                      {formatTimeSpent(submissions.reduce((acc, sub) => acc + sub.timeSpent, 0))}
                    </p>
                    <p className="text-sm text-purple-600">Total Time</p>
                  </div>
                </div>

                {/* Individual Submissions */}
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <div key={submission.id} className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-white">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-slate-800 mb-2">
                            {submission.exam.name}
                          </h4>
                          <p className="text-sm text-slate-500">
                            Completed {getTimeSince(submission.completedAt)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className={`text-sm font-medium border ${getPercentageColor(submission.percentage)}`}>
                            {getGrade(submission.percentage)}
                          </Badge>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-slate-800">
                              {submission.score}/{submission.exam.totalMarks}
                            </p>
                            <p className="text-sm text-slate-500">
                              {submission.percentage}%
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-6 text-sm mb-4">
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="w-5 h-5 text-slate-400" />
                          <span className="text-slate-600">
                            {submission.totalAnswered}/{submission.totalQuestions} answered
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Timer className="w-5 h-5 text-slate-400" />
                          <span className="text-slate-600">
                            {formatTimeSpent(submission.timeSpent)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-5 h-5 text-slate-400" />
                          <span className="text-slate-600">
                            {submission.exam.timeLimit}min limit
                          </span>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-slate-500 mb-2">
                          <span>Performance</span>
                          <span>{submission.percentage}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-500 ${
                              submission.percentage >= 80 ? 'bg-green-500' :
                              submission.percentage >= 60 ? 'bg-blue-500' :
                              submission.percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${submission.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" onClick={() => router.back()} className='cursor-pointer'>
            Back to Users
          </Button>
          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 cursor-pointer">
            Manage Account
          </Button>
        </div>
      </div>
    </div>
  );
}