import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { getAiResponse } from "@/lib/ai/gemini";
import { MARKING_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { PastPaperQuestion, TopicMarkingScheme } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { questionId, studentAnswer, studentId } = body;

    if (!questionId || !studentAnswer || !studentId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    console.log(`[Marking API] Submission for question: ${questionId}`);

    const questionRef = doc(db, "questions", questionId);
    const questionSnap = await getDoc(questionRef);

    if (!questionSnap.exists()) {
       // Return a slightly more robust mock for demo if question doesn't exist
       console.warn(`Question ${questionId} not found, using generic marking.`);
    }

    const questionData = questionSnap.exists()
      ? questionSnap.data() as PastPaperQuestion
      : {
          subjectId: "Biology",
          topicId: "General",
          text: "General Question",
          marks: 4,
          markingScheme: "Generic scheme",
          requiredKeywords: []
        };

    const markingSchemeRef = doc(db, "markingSchemes", questionData.subjectId, "topics", questionData.topicId);
    const markingSchemeSnap = await getDoc(markingSchemeRef);

    let markingSchemeData: TopicMarkingScheme | null = null;
    if (markingSchemeSnap.exists()) {
      markingSchemeData = markingSchemeSnap.data() as TopicMarkingScheme;
    }

    const prompt = MARKING_SYSTEM_PROMPT
      .replace("{{SUBJECT}}", questionData.subjectId)
      .replace("{{LEVEL}}", "S3/S4")
      .replace("{{TOPIC}}", questionData.topicId)
      .replace("{{QUESTION_TEXT}}", questionData.text)
      .replace("{{MARKS}}", questionData.marks.toString())
      .replace("{{MARKING_SCHEME}}", questionData.markingScheme)
      .replace("{{REQUIRED_KEYWORDS}}", (questionData.requiredKeywords || []).join(", "))
      .replace("{{COMMON_MISTAKES}}", (markingSchemeData?.commonMistakes || []).join(", ") || "None specified")
      .replace("{{STUDENT_ANSWER}}", studentAnswer);

    const aiResponse = await getAiResponse(studentAnswer, prompt);

    if (!aiResponse) {
      throw new Error("AI Marking Engine returned an empty response.");
    }

    // Robustly parse the JSON response from AI
    let result;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      const cleanJson = jsonMatch ? jsonMatch[0] : aiResponse;
      result = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error("AI JSON Parse Error:", aiResponse, parseError);
      // Fallback response to avoid crash
      result = {
        score: 1,
        outOf: questionData.marks,
        percentage: 25,
        grade: "D",
        keyPointsEarned: ["Answer received"],
        keyPointsMissed: ["Detailed marking failed"],
        feedback: "We received your answer, but our marking engine is having trouble generating detailed feedback. Please try again later.",
        improvedAnswer: "N/A",
        examTip: "Keep practicing!"
      };
    }

    const progressRef = doc(db, "students", studentId, "progress", "questions", "submissions", questionId);
    await setDoc(progressRef, {
      ...result,
      studentAnswer,
      timestamp: Timestamp.now(),
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("AI Marking Route Exception:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
