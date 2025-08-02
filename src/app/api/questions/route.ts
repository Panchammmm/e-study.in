// GET /api/questions - Get all questions with pagination and filters
// This will handle listing questions with pagination, search, and filters

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

// Schema for query parameters validation
const querySchema = z.object({
  page: z.string().optional().transform((val) => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform((val) => val ? parseInt(val, 10) : 20),
  subject: z.string().optional(),
  topic: z.string().optional(), // ✅ NEW: Added topic parameter
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  search: z.string().optional(),
  tags: z.string().optional(),
  authorId: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'subject', 'difficulty']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export async function GET(request: Request) {
  const token = request.headers.get('x-auth-token');

  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    // Verify JWT token
    jwt.verify(token, JWT_SECRET) as { id: string; email: string };

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const parsedQuery = querySchema.safeParse(queryParams);

    if (!parsedQuery.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: parsedQuery.error.issues },
        { status: 400 }
      );
    }

    const { page, limit, subject, topic, difficulty, search, tags, authorId, sortBy, sortOrder } = parsedQuery.data;

    // Validate pagination limits
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters. Page must be >= 1, limit must be between 1-100' },
        { status: 400 }
      );
    }

    // Build where clause for filtering
    const where: {
      subject?: { contains: string; mode: 'insensitive' };
      topic?: { contains: string; mode: 'insensitive' }; // ✅ NEW: Added topic filter
      difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
      authorId?: string;
      OR?: Array<{
        content?: { contains: string; mode: 'insensitive' };
        subject?: { contains: string; mode: 'insensitive' };
        topic?: { contains: string; mode: 'insensitive' };
        tags?: { hasSome: string[] };
        layer1Text?: { contains: string; mode: 'insensitive' };
        layer2Text?: { contains: string; mode: 'insensitive' };
        layer3Text?: { contains: string; mode: 'insensitive' };
        options?: { hasSome: string[] };
        explanationText?: { contains: string; mode: 'insensitive' };
      }>;
      tags?: { hasSome: string[] };
    } = {};

    if (subject) {
      where.subject = { contains: subject, mode: 'insensitive' };
    }

    if (topic) {
      where.topic = { contains: topic, mode: 'insensitive' };
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (authorId) {
      where.authorId = authorId;
    }

    if (search) {
      where.OR = [
        // Basic fields
        { content: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { topic: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } },

        // Layer 1
        { layer1Text: { contains: search, mode: 'insensitive' } },

        // Layer 2
        { layer2Text: { contains: search, mode: 'insensitive' } },

        // Layer 3
        { layer3Text: { contains: search, mode: 'insensitive' } },

        // Options and Explanation
        { options: { hasSome: [search] } },
        { explanationText: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      where.tags = { hasSome: tagArray };
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build orderBy clause
    const orderBy: Record<string, 'asc' | 'desc'> = {};
    orderBy[sortBy] = sortOrder;

    // Execute queries in parallel for better performance
    const [questions, totalCount, filterMetadata] = await Promise.all([
      // Get paginated questions
      prisma.question.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              exams: true,
              examSections: true,
            },
          },
        },
      }),
      // Get total count for pagination
      prisma.question.count({ where }),
      // ✅ NEW: Get complete filter metadata for dropdowns
      Promise.all([
        // Get all unique subjects
        prisma.question.findMany({
          select: { subject: true },
          distinct: ['subject']
        }).then(results =>
          results
            .map(r => r.subject)
            .filter(subject => subject && subject.trim() !== '')
            .sort()
        ),

        // Get all unique topics
        prisma.question.findMany({
          select: { topic: true },
          distinct: ['topic']
        }).then(results =>
          results
            .map(r => r.topic)
            .filter(topic => topic && topic.trim() !== '')
            .sort()
        ),

        // Get all unique tags
        prisma.question.findMany({
          select: { tags: true }
        }).then(results => {
          const allTags = results.flatMap(r => r.tags || []);
          return [...new Set(allTags)]
            .filter(tag => tag && tag.trim() !== '')
            .sort();
        })
      ]).then(([subjects, topics, tags]) => ({
        subjects,
        topics,
        difficulties: ['EASY', 'MEDIUM', 'HARD'] as const,
        tags
      }))
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      data: {
        questions,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalCount,
          itemsPerPage: limit,
          hasNextPage,
          hasPrevPage,
        },
        filters: {
          subject,
          topic, // ✅ NEW: Include topic in response filters
          difficulty,
          search,
          tags: tags ? tags.split(',').map(tag => tag.trim()) : undefined,
          authorId,
        },
        sorting: {
          sortBy,
          sortOrder,
        },
        // ✅ NEW: Complete filter metadata for consistent dropdown options
        filterMetadata,
      },
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
