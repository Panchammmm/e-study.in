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
        { score: 'desc' },       
        { createdAt: 'asc' }    
      ]
    });
  },
  ['exam-rankings'], // (Next.js handles params internally)
  { 
    revalidate: 180,
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

    if (!examId) {
      return Response.json({
        success: false,
        message: 'examId is required',
      }, { status: 400 });
    }

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

    if (!exam || !exam.isPublished) {
      return Response.json({
        success: false,
        message: 'Exam not available'
      }, { status: 404 });
    }

    // Fetch raw rankings
    const rawRankings = await getCachedExamRankings(examId);

    if (rawRankings.length === 0) {
      return Response.json({
        success: true,
        data: {
          examId,
          rankings: [],
          top5: [],
          personalRank: null,
          totalParticipants: 0
        }
      });
    }

    // Compute rank dynamically (IMPORTANT FIX)
    const rankingsWithRank = rawRankings.map((r, index) => ({
      ...r,
      rank: index + 1
    }));

    // Format rankings (ALL users)
    const allRankings = rankingsWithRank.map(ranking => ({
      rank: ranking.rank,
      userId: ranking.userId,
      userName: ranking.user.name,
      userEmail: ranking.user.email,
      score: ranking.score,
      percentage: parseFloat(ranking.percentage.toFixed(2)),
      completedAt: ranking.completedAt,
      timeTaken: ranking.completedAt
        ? Math.floor(
            (new Date(ranking.completedAt).getTime() -
              new Date(ranking.createdAt).getTime()) / 1000
          )
        : 0
    }));

    // Top 5 (optional section)
    const top5 = allRankings.slice(0, 5);

    // Personal Rank
    let personalRank = null;

    const userRanking = rankingsWithRank.find(r => r.userId === userId);

    if (userRanking) {
      const betterThanCount = rankingsWithRank.filter(
        r => r.rank > userRanking.rank
      ).length;

      const percentile = parseFloat(
        ((betterThanCount / rankingsWithRank.length) * 100).toFixed(1)
      );

      personalRank = {
        rank: userRanking.rank,
        userId: userRanking.userId,
        userName: userRanking.user.name,
        score: userRanking.score,
        percentage: parseFloat(userRanking.percentage.toFixed(2)),
        totalParticipants: rankingsWithRank.length,
        percentile
      };
    }

    return Response.json({
      success: true,
      data: {
        examId,
        examName: exam.name,
        totalMarks: exam.totalMarks,

        // FULL LIST HERE
        rankings: allRankings,

        // optional
        top5,

        personalRank,
        totalParticipants: rankingsWithRank.length
      }
    });

  } catch (error) {
    console.error(error);

    return Response.json({
      success: false,
      message: 'Server error'
    }, { status: 500 });
  }
}