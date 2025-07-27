import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import jwt from "jsonwebtoken";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";

// Schema for creating a question

const createQuestionSchema = z.object({
  // Legacy fields
  content: z.string().optional(),
  questionImage: z.string().optional(),

  // 3-Layer Question System
  layer1Type: z.enum(["text", "image", "none"]),
  layer1Text: z.string().optional(),
  layer1Image: z.string().optional(),
  layer2Type: z.enum(["text", "image", "none"]),
  layer2Text: z.string().optional(),
  layer2Image: z.string().optional(),
  layer3Type: z.enum(["text", "image", "none"]),
  layer3Text: z.string().optional(),
  layer3Image: z.string().optional(),

  // Enhanced Options System
  options: z.array(z.string()).min(2, "At least 2 options are required"),
  optionImages: z.array(z.string()).optional().default([]),
  optionTypes: z.array(z.enum(["text", "image"])),
  correctOption: z.number().min(0, "Correct option must be a valid index"),

  // Marking System
  positiveMarks: z.number().nonnegative("Positive marks must be >= 0"),
  negativeMarks: z.number().nonnegative("Negative marks must be >= 0"),

  // Explanation System
  explanationType: z.enum(["text", "image", "none"]),
  explanationText: z.string().optional(),
  explanationImage: z.string().optional(),

  // Other meta
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM"),
  subject: z.string().min(1, "Subject is required"),
  topic: z.string().min(1, "Topic is required"),
  tags: z.array(z.string()).optional().default([]),

  // Legacy field
  marks: z.number().optional(),
});

// POST - Create a new question
export async function POST(request: Request) {
  const token = request.headers.get("x-auth-token");

  if (!token) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
    };
    const userId = decoded.id;

    const body = await request.json();
    const parsedData = createQuestionSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        { error: "Invalid input data", details: parsedData.error.issues },
        { status: 400 }
      );
    }

    const {
      // Legacy fields
      content,
      questionImage,

      // 3-Layer Question System
      layer1Type,
      layer1Text,
      layer1Image,
      layer2Type,
      layer2Text,
      layer2Image,
      layer3Type,
      layer3Text,
      layer3Image,

      // Enhanced Options System
      options,
      optionImages,
      optionTypes,
      correctOption,

      // Marking System
      positiveMarks,
      negativeMarks,

      // Explanation System
      explanationType,
      explanationText,
      explanationImage,

      // Other meta
      difficulty,
      subject,
      topic,
      tags,

      // Legacy field
      marks,
    } = parsedData.data;

    // Validate correct option index
    if (correctOption >= options.length) {
      return NextResponse.json(
        { error: "Correct option index is out of range" },
        { status: 400 }
      );
    }

    // Check if user exists and has permission to create questions
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, isActive: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "Account is not active" },
        { status: 403 }
      );
    }

    // Only allow ADMIN and MODERATOR roles to create questions
    if (!["ADMIN", "MODERATOR"].includes(user.role)) {
      return NextResponse.json(
        { error: "You do not have permission to create questions" },
        { status: 403 }
      );
    }

    // Create the question
    const newQuestion = await prisma.question.create({
  data: {
    // Legacy
    content: content || "",
    questionImage: questionImage || null,

    // 3-Layer System
    layer1Type,
    layer1Text,
    layer1Image,
    layer2Type,
    layer2Text,
    layer2Image,
    layer3Type,
    layer3Text,
    layer3Image,

    // Options
    options,
    optionImages: optionImages || [],
    optionTypes,
    correctOption,

    // Marking
    positiveMarks,
    negativeMarks,

    // Explanation
    explanationType,
    explanationText,
    explanationImage,

    // Meta
    difficulty,
    subject,
    topic,
    tags,
    // Authorship
    authorId: userId,
  },
  include: {
    author: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
  },
});


    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error) {
    console.error("Error creating question:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
