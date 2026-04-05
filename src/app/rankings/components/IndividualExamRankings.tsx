"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Crown, Award, User, Calendar, Clock } from 'lucide-react';

interface ExamRanking {
    rank: number;
    userId: string;
    userName: string;
    userEmail: string;
    score: number;
    percentage: number;
    completedAt: string;
    timeTaken?: number;
}

interface Exam {
    id: string;
    name: string;
    description: string;
}

export default function IndividualExamRankings() {
    const [rankings, setRankings] = useState<ExamRanking[]>([]);
    const [personalRank, setPersonalRank] = useState<(ExamRanking & { totalParticipants: number; hasNotTakenExam?: boolean; percentile?: number }) | null>(null);
    const [exams, setExams] = useState<Exam[]>([]);
    const [selectedExamId, setSelectedExamId] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchExams = async () => {
        try {
            const response = await fetch('/api/exams?page=1&limit=10&published=true', {
                credentials: 'include',
            });
            const data = await response.json();
            if (data.success) {
                setExams(data.data.exams);
                if (data.data.exams.length > 0) {
                    setSelectedExamId(data.data.exams[0].id);
                }
            }
        } catch (err) {
            console.error('Failed to fetch exams:', err);
        }
    };

    const fetchExamRankings = useCallback(async () => {
        if (!selectedExamId) return;

        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/rankings/individual?examId=${selectedExamId}`, {
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                setRankings(data.data.rankings || []);
                // Add totalParticipants from root level to personalRank
                const personalRankData = data.data.personalRank ? {
                    ...data.data.personalRank,
                    totalParticipants: data.data.totalParticipants
                } : null;
                setPersonalRank(personalRankData);
            } else {
                setError('Failed to fetch exam rankings');
            }
        } catch (err) {
            setError('Network error occurred');
        } finally {
            setLoading(false);
        }
    }, [selectedExamId]);

    useEffect(() => {
        fetchExams();
    }, []);

    useEffect(() => {
        if (selectedExamId) {
            fetchExamRankings();
        }
    }, [selectedExamId, fetchExamRankings]);

    const getMedalIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />;
            case 2:
                return <Medal className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />;
            case 3:
                return <Award className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500" />;
            default:
                return <div className="h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center text-gray-600 font-bold text-xs sm:text-sm">#{rank}</div>;
        }
    };

    const getRankCardStyle = (rank: number, isPersonal: boolean) => {
        let baseStyle = "transition-all duration-200 hover:shadow-sm ";

        if (isPersonal) {
            baseStyle += "bg-gradient-to-r from-green-50 to-green-100 border-green-200 ";
        } else if (rank === 1) {
            baseStyle += "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200 ";
        } else if (rank === 2) {
            baseStyle += "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 ";
        } else if (rank === 3) {
            baseStyle += "bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 ";
        } else {
            baseStyle += "bg-white border-gray-100 ";
        }

        return baseStyle;
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
                <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                        Exam Rankings
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        <span className="hidden sm:inline">All candidates ranking</span>
                        <span className="sm:hidden">All candidates ranking</span>
                    </p>
                </div>

                {/* Exam Selector */}
                <div className="w-full sm:w-64 lg:w-72">
                    <Select value={selectedExamId} onValueChange={setSelectedExamId}>
                        <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                            <SelectValue placeholder="Select an exam..." />
                        </SelectTrigger>
                        <SelectContent>
                            {exams.map((exam) => (
                                <SelectItem key={exam.id} value={exam.id} className="text-xs sm:text-sm">
                                    <span className="truncate">{exam.name}</span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Content */}
            {!selectedExamId ? (
                <Card className="p-6 sm:p-8 text-center">
                    <Trophy className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                    <p className="text-gray-600 text-sm sm:text-base">Select an exam to view rankings</p>
                </Card>
            ) : loading ? (
                <div className="space-y-3 sm:space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-20 sm:h-16 w-full rounded-lg" />
                    ))}
                </div>
            ) : error ? (
                <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                        <span className="text-sm sm:text-base">{error}</span>
                        <Button
                            onClick={fetchExamRankings}
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto"
                        >
                            Try Again
                        </Button>
                    </AlertDescription>
                </Alert>
            ) : (
                <div className="space-y-4">
                    {/* Top 5 Rankings */}
                    <div className="space-y-3 sm:space-y-4">
                        {/* <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                            <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-teal-600 flex-shrink-0" />
                            Top 5 Performers
                        </h4> */}
                        
                        {rankings.length === 0 ? (
                            <Card className="bg-gray-50 border-gray-200">
                                <CardContent className="p-6 sm:p-8 text-center">
                                    <div className="flex flex-col items-center gap-3 sm:gap-4">
                                        <Trophy className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300" />
                                        <div>
                                            <h4 className="text-base sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2">
                                                No one has taken this exam yet
                                            </h4>
                                            <p className="text-xs sm:text-sm text-gray-500">
                                                Be the first to take this exam and claim the top spot!
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <>
                                {/* Table Header - Hidden on mobile, shown on desktop */}
                                <div className="hidden lg:block bg-gray-50 rounded-lg p-4 border">
                                    <div className="grid grid-cols-11 gap-4 text-sm font-medium text-gray-600">
                                        <div className="col-span-1 text-center">Rank</div>
                                        <div className="col-span-4">User</div>
                                        <div className="col-span-2 text-center">Score</div>
                                        <div className="col-span-2 text-center">Percentage</div>
                                        <div className="col-span-2 text-center">Completed</div>
                                    </div>
                                </div>

                                {/* Rankings */}
                                <div className="space-y-2 sm:space-y-3">
                                    {rankings.map((ranking) => (
                                        <Card
                                            key={ranking.userId}
                                            className="transition-all duration-200 hover:shadow-md hover:bg-gray-50 bg-white border-gray-200"
                                        >
                                            <CardContent className="p-3 sm:p-4">
                                                {/* Mobile Layout */}
                                                <div className="block lg:hidden">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                                                            {/* Rank */}
                                                            <div className="flex-shrink-0">
                                                                {ranking.rank <= 3 ? (
                                                                    getMedalIcon(ranking.rank)
                                                                ) : (
                                                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                                                        <span className="text-xs sm:text-sm font-semibold text-gray-600">{ranking.rank}</span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* User Info */}
                                                            <div className="flex items-center space-x-2 flex-1 min-w-0">
                                                                <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                                                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${ranking.userName}`} />
                                                                    <AvatarFallback className="bg-teal-100 text-teal-700 text-xs sm:text-sm">
                                                                        {ranking.userName.charAt(0).toUpperCase()}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div className="min-w-0 flex-1">
                                                                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                                                                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                                                                            {ranking.userName}
                                                                        </h4>
                                                                        {ranking.rank <= 3 && (
                                                                            <Badge
                                                                                variant="secondary"
                                                                                className={`text-xs ${
                                                                                    ranking.rank === 1 ? "bg-yellow-100 text-yellow-800" :
                                                                                    ranking.rank === 2 ? "bg-gray-100 text-gray-800" :
                                                                                    "bg-orange-100 text-orange-800"
                                                                                }`}
                                                                            >
                                                                                Top {ranking.rank}
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    {/* <p className="text-xs text-gray-500 truncate">
                                                                        {ranking.userEmail}
                                                                    </p> */}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Stats Grid */}
                                                    <div className="grid grid-cols-3 gap-3 mb-3 items-center">
                                                        <div className="text-center">
                                                            <div className="font-semibold text-gray-900 text-sm sm:text-base">
                                                                {ranking.score}
                                                            </div>
                                                            <div className="text-xs text-gray-500">points</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="text-lg sm:text-xl font-bold text-teal-600">
                                                                {ranking.percentage}%
                                                            </div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
                                                                <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                                                <span className="hidden sm:inline">
                                                                    {new Date(ranking.completedAt).toLocaleDateString()}
                                                                </span>
                                                                <span className="sm:hidden">
                                                                    {new Date(ranking.completedAt).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            {/* {ranking.timeTaken && (
                                                                <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mt-1">
                                                                    <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                                                    {Math.round(ranking.timeTaken / 60)}m
                                                                </div>
                                                            )} */}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Desktop Layout */}
                                                <div className="hidden lg:block">
                                                    <div className="grid grid-cols-11 gap-4 items-center">
                                                        {/* Rank */}
                                                        <div className="col-span-1 text-center">
                                                            <div className="flex justify-center">
                                                                {ranking.rank <= 3 ? (
                                                                    getMedalIcon(ranking.rank)
                                                                ) : (
                                                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                                                        <span className="text-sm font-semibold text-gray-600">
                                                                            {ranking.rank}
                                                                            {rankings.filter(r => r.rank === ranking.rank).length > 1 && (
                                                                                <span className="ml-1 text-xs text-gray-400">(Tied)</span>
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* User Info */}
                                                        <div className="col-span-4 flex items-center space-x-3">
                                                            <Avatar className="h-10 w-10">
                                                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${ranking.userName}`} />
                                                                <AvatarFallback className="bg-teal-100 text-teal-700">
                                                                    {ranking.userName.charAt(0).toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <h4 className="font-semibold text-gray-900">
                                                                        {ranking.userName}
                                                                    </h4>
                                                                    {ranking.rank <= 3 && (
                                                                        <Badge
                                                                            variant="secondary"
                                                                            className={`text-xs ${
                                                                                ranking.rank === 1 ? "bg-yellow-100 text-yellow-800" :
                                                                                ranking.rank === 2 ? "bg-gray-100 text-gray-800" :
                                                                                "bg-orange-100 text-orange-800"
                                                                            }`}
                                                                        >
                                                                            Top {ranking.rank}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                {/* <p className="text-xs text-gray-500">
                                                                    {ranking.userEmail}
                                                                </p> */}
                                                            </div>
                                                        </div>

                                                        {/* Score */}
                                                        <div className="col-span-2 text-center">
                                                            <div className="font-semibold text-gray-900">
                                                                {ranking.score}
                                                            </div>
                                                            <div className="text-xs text-gray-500">points</div>
                                                        </div>

                                                        {/* Percentage */}
                                                        <div className="col-span-2 text-center">
                                                            <div className="text-lg font-bold text-teal-600">
                                                                {ranking.percentage}%
                                                            </div>
                                                        </div>

                                                        {/* Completed Date */}
                                                        <div className="col-span-2 text-center">
                                                            <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
                                                                <Calendar className="h-3 w-3" />
                                                                {new Date(ranking.completedAt).toLocaleDateString()}
                                                            </div>
                                                            {/* {ranking.timeTaken && (
                                                                <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mt-1">
                                                                    <Clock className="h-3 w-3" />
                                                                    {Math.round(ranking.timeTaken / 60)}m
                                                                </div>
                                                            )} */}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Personal Rank */}
                    {personalRank && (
                        <div className="mt-4 sm:mt-6">
                            <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                                <User className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
                                Your Performance
                            </h4>
                            {personalRank.hasNotTakenExam ? (
                                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                                    <CardContent className="p-4 text-center">
                                        <div className="flex flex-col items-center gap-2 sm:gap-3">
                                            <Trophy className="h-10 w-10 sm:h-12 sm:w-12 text-blue-400" />
                                            <div>
                                                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                                                    You haven&apos;t taken this exam yet
                                                </h4>
                                                <p className="text-xs sm:text-sm text-gray-600">
                                                    {personalRank.totalParticipants === 0
                                                        ? "No one has completed this exam yet"
                                                        : `${personalRank.totalParticipants} participant${personalRank.totalParticipants !== 1 ? 's' : ''} have completed this exam`
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card className={getRankCardStyle(personalRank.rank || 0, true)}>
                                    <CardContent className="p-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                                            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                                                <div className="flex-shrink-0">
                                                    {getMedalIcon(personalRank.rank || 0)}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h4 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                                                            {personalRank.userName}
                                                        </h4>
                                                        <Badge variant="default" className="bg-green-600 text-xs">
                                                            <User className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                                                            You
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs sm:text-sm text-gray-600">
                                                        Rank {personalRank.rank} of {personalRank.totalParticipants} participants
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-center sm:text-right flex-shrink-0">
                                                <div className="text-xl sm:text-2xl font-bold text-green-600">
                                                    {personalRank.percentage}%
                                                </div>
                                                <p className="text-xs sm:text-sm text-gray-500">
                                                    {personalRank.score} points
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
