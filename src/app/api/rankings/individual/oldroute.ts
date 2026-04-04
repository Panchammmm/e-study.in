import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { unstable_cache } from 'next/cache';
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";


// Cached function for exam rankings
const getCachedExamRankings = unstable_cache(
  async (examId: string) => {
    return await prisma.ranking.findMany({
      where: { examId: examId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        { rank: 'asc' },
        { score: 'desc' }
      ]
    });
  },
  ['exam-rankings'],
  { 
    revalidate: 180, // 3 minutes cache (shorter than global)
    tags: ['rankings', 'exam-rankings'] 
  }
);

export async function GET(request: NextRequest) {
  const token = request.headers.get("x-auth-token");

  if (!token) {
    return Response.json({
      success: false,
      message: 'Authentication required',
      errorCode: 'AUTH_REQUIRED'
    }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
    };
    const userId = decoded.id;

    const { searchParams } = new URL(request.url);
    const examId = searchParams.get('examId');
    // const userId = searchParams.get('userId');

    // Enhanced input validation
    if (!examId || examId.trim() === '') {
      return Response.json({
        success: false,
        message: 'Valid examId is required',
        errorCode: 'MISSING_EXAM_ID'
      }, { status: 400 });
    }

    // Validate examId format (assuming UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(examId)) {
      return Response.json({
        success: false,
        message: 'Invalid examId format',
        errorCode: 'INVALID_EXAM_ID'
      }, { status: 400 });
    }

    // Validate userId format if provided
    if (userId && !uuidRegex.test(userId)) {
      return Response.json({
        success: false,
        message: 'Invalid userId format',
        errorCode: 'INVALID_USER_ID'
      }, { status: 400 });
    }

    // First, verify exam exists
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: {
        id: true,
        name: true,
        description: true,
        isPublished: true,
        totalMarks: true
      }
    });

    if (!exam) {
      return Response.json({
        success: false,
        message: 'Exam not found',
        errorCode: 'EXAM_NOT_FOUND'
      }, { status: 404 });
    }

    if (!exam.isPublished) {
      return Response.json({
        success: false,
        message: 'Exam rankings are not available for unpublished exams',
        errorCode: 'EXAM_NOT_PUBLISHED'
      }, { status: 403 });
    }

    // Get cached rankings for specific exam
    const rankings = await getCachedExamRankings(examId);

    if (rankings.length === 0) {
      return Response.json({
        success: true,
        data: {
          examId: examId,
          examName: exam.name,
          examDescription: exam.description,
          top5: [],
          personalRank: null,
          totalParticipants: 0,
          statistics: {
            averageScore: 0,
            averagePercentage: 0,
            highestScore: 0,
            lowestScore: 0
          }
        },
        timestamp: new Date().toISOString()
      }, { status: 200 });
    }

    // Calculate statistics
    const scores = rankings.map(r => r.score);
    const percentages = rankings.map(r => r.percentage);
    const statistics = {
      averageScore: parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)),
      averagePercentage: parseFloat((percentages.reduce((a, b) => a + b, 0) / percentages.length).toFixed(2)),
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores),
      totalParticipants: rankings.length
    };

    // Get top 5
    const top5 = rankings.slice(0, 5).map(ranking => ({
      rank: ranking.rank,
      userId: ranking.userId,
      userName: ranking.user.name,
      userEmail: ranking.user.email,
      score: ranking.score,
      percentage: parseFloat(ranking.percentage.toFixed(2)),
      completedAt: ranking.completedAt,
      timeTaken: ranking.completedAt ? 
        Math.floor((new Date(ranking.completedAt).getTime() - new Date(ranking.createdAt).getTime()) / 1000) : 0
    }));

    // Find personal rank if userId provided
    let personalRank = null;
    if (userId) {
      const userRanking = rankings.find(r => r.userId === userId);
      if (userRanking) {
        const betterThanCount = rankings.filter(r => r.rank > userRanking.rank).length;
        const percentile = betterThanCount > 0 ? 
          parseFloat(((betterThanCount / rankings.length) * 100).toFixed(1)) : 0;

        personalRank = {
          rank: userRanking.rank,
          userId: userRanking.userId,
          userName: 'ADMIN SYSTEM',
          userEmail: 'ADMIN SYSTEM',
          score: userRanking.score,
          percentage: parseFloat(userRanking.percentage.toFixed(2)),
          completedAt: userRanking.completedAt,
          totalParticipants: rankings.length,
          percentile: percentile,
          performance: {
            scoreAboveAverage: userRanking.score > statistics.averageScore,
            percentageAboveAverage: userRanking.percentage > statistics.averagePercentage,
            rankCategory: userRanking.rank <= 5 ? 'top5' : 
                        userRanking.rank <= Math.ceil(rankings.length * 0.1) ? 'top10%' :
                        userRanking.rank <= Math.ceil(rankings.length * 0.25) ? 'top25%' : 'other'
          }
        };
      } else {
        // User exists but hasn't taken this exam
        const userExists = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, name: true }
        });

        if (userExists) {
          personalRank = {
            rank: null,
            userId: userExists.id,
            userName: userExists.name,
            userEmail: null,
            score: null,
            percentage: null,
            completedAt: null,
            totalParticipants: rankings.length,
            percentile: null,
            hasNotTakenExam: true
          };
        }
      }
    }

    return Response.json({
      success: true,
      data: {
        examId: examId,
        examName: exam.name,
        examDescription: exam.description,
        totalMarks: exam.totalMarks,
        top5: top5,
        personalRank: personalRank,
        totalParticipants: rankings.length,
        statistics: statistics,
        metadata: {
          lastUpdated: rankings[0]?.createdAt,
          rankingMethod: 'score_desc_time_asc'
        }
      },
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('Individual ranking error:', error);
    
    // Enhanced error handling
    if (error instanceof Error) {
      // Database connection errors
      if (error.message.includes('connection') || error.message.includes('ECONNREFUSED')) {
        return Response.json({
          success: false,
          message: 'Database connection failed. Please try again later.',
          errorCode: 'DB_CONNECTION_ERROR'
        }, { status: 503 });
      }
      
      // Prisma specific errors
      if (error.message.includes('Prisma')) {
        return Response.json({
          success: false,
          message: 'Database query failed. Please try again.',
          errorCode: 'DB_QUERY_ERROR'
        }, { status: 500 });
      }
      
      // Validation errors
      if (error.message.includes('validation') || error.message.includes('Invalid')) {
        return Response.json({
          success: false,
          message: 'Data validation failed.',
          errorCode: 'VALIDATION_ERROR'
        }, { status: 400 });
      }
    }
    
    // Generic server error
    return Response.json({
      success: false,
      message: 'Internal server error occurred while fetching individual rankings.',
      errorCode: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}

// Cache invalidation function
export async function invalidateExamRankingsCache() {
  try {
    const { revalidateTag } = await import('next/cache');
    revalidateTag('exam-rankings');
  } catch (error) {
    console.warn('Could not invalidate exam rankings cache:', error);
  }
}
