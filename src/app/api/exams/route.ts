// POST /api/exams - Create a new exam
// GET /api/exams - Get all exams

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

// Schema for creating an exam
const createExamSchema = z.object({
  name: z.string().min(1, 'Exam name is required'),
  description: z.string().optional().default(''),
  timeLimit: z.number().min(1, 'Time limit must be at least 1 minute'),
  isPasswordProtected: z.boolean().optional().default(false),
  password: z.string().optional(),
  instructions: z.string().optional().default(''),
});

// Schema for query parameters
const querySchema = z.object({
  page: z.string().optional().transform((val) => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform((val) => val ? parseInt(val, 10) : 20),
  published: z.string().optional().transform((val) => val === 'true' ? true : val === 'false' ? false : undefined),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'name']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// POST - Create a new exam
export async function POST(request: Request) {
  const token = request.headers.get('x-auth-token');

  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    const userId = decoded.id;

    // Check if user exists and has permission to create exams
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, name: true, email: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
      return NextResponse.json({ error: 'Insufficient permissions to create exams' }, { status: 403 });
    }

    const body = await request.json();
    const parsedData = createExamSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsedData.error.issues },
        { status: 400 }
      );
    }

    const { name, description, timeLimit, isPasswordProtected, password, instructions } = parsedData.data;

    // Validate password if exam is password protected
    if (isPasswordProtected && !password) {
      return NextResponse.json(
        { error: 'Password is required when exam is password protected' },
        { status: 400 }
      );
    }

    // Create the exam
    const exam = await prisma.exam.create({
      data: {
        name,
        description,
        timeLimit,
        isPasswordProtected,
        password: isPasswordProtected ? password : null,
        instructions,
        createdById: userId,
        isPublished: false,
        isDraft: true,
        totalMarks: 0,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        sections: {
          include: {
            questions: {
              include: {
                question: true,
              },
            },
          },
        },
        _count: {
          select: {
            questions: true,
            sections: true,
            submissions: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: exam,
      message: 'Exam created successfully',
    });

  } catch (error) {
    console.error('Error creating exam:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - Get all exams with pagination and filters
export async function GET(request: Request) {
  const token = request.headers.get('x-auth-token');

  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    const userId = decoded.id;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    const parsedQuery = querySchema.safeParse(queryParams);
    
    if (!parsedQuery.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: parsedQuery.error.issues },
        { status: 400 }
      );
    }

    const { page, limit, published, search, sortBy, sortOrder } = parsedQuery.data;

    // Validate pagination limits
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters. Page must be >= 1, limit must be between 1-100' },
        { status: 400 }
      );
    }

    // Build where clause for filtering
    const where: {
      isPublished?: boolean;
      OR?: Array<{
        name?: { contains: string; mode: 'insensitive' };
        description?: { contains: string; mode: 'insensitive' };
      }>;
    } = {};

    // For non-admin users, only show published exams
    if (user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
      where.isPublished = true;
    } else if (published !== undefined) {
      where.isPublished = published;
    }

    // Add search functionality
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build orderBy clause
    const orderBy: Record<string, 'asc' | 'desc'> = {};
    orderBy[sortBy] = sortOrder;

    // Execute queries in parallel for better performance
    const [exams, totalCount] = await Promise.all([
      prisma.exam.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy,
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          sections: {
            select: {
              id: true,
              name: true,
              description: true,
              timeLimit: true,
              marks: true,
              _count: {
                select: {
                  questions: true,
                },
              },
            },
          },
          _count: {
            select: {
              questions: true,
              sections: true,
              submissions: true,
            },
          },
        },
      }),
      prisma.exam.count({ where }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Transform exams to include computed fields
    const transformedExams = exams.map(exam => ({
      ...exam,
      // Remove password from response for security
      password: exam.isPasswordProtected ? '[PROTECTED]' : undefined,
      questionsCount: exam._count.questions,
      sectionsCount: exam._count.sections,
      submissionsCount: exam._count.submissions,
    }));

    return NextResponse.json({
      success: true,
      data: {
        exams: transformedExams,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalCount,
          itemsPerPage: limit,
          hasNextPage,
          hasPrevPage,
        },
        filters: {
          published,
          search,
        },
        sorting: {
          sortBy,
          sortOrder,
        },
      },
    });

  } catch (error) {
    console.error('Error fetching exams:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}