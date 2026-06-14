import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { getAiResponse } from "@/lib/ai/nvidia";
import { MARKING_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { PastPaperQuestion, TopicMarkingScheme } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { questionId, studentAnswer, studentId } = body;

    if (!questionId || !studentAnswer || !studentId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    console.log(`[Marking API] Student ${studentId} submitted answer for ${questionId}`);

    const questionRef = doc(db, "questions", questionId);
    const questionSnap = await getDoc(questionRef);

    if (!questionSnap.exists()) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const questionData = questionSnap.data() as PastPaperQuestion;

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
      .replace("{{REQUIRED_KEYWORDS}}", questionData.requiredKeywords.join(", "))
      .replace("{{COMMON_MISTAKES}}", markingSchemeData?.commonMistakes.join(", ") || "None specified")
      .replace("{{STUDENT_ANSWER}}", studentAnswer);

    const aiResponse = await getAiResponse(studentAnswer, prompt);

    if (!aiResponse) {
      throw new Error("AI Marking Engine returned an empty response.");
    }

    // Robustly parse the JSON response from AI
    let result;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      const cleanJson = jsonMatch ? jsonMatch[0] : aiResponse.replace(/\`\\`\`json/g, "").replace(/\`\\`\`/g, "").trim();
      result = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error("AI JSON Parse Error:", aiResponse, parseError);
      throw new Error("Failed to parse AI marking response as JSON");
    }

    const progressRef = doc(db, "students", studentId, "progress", "questions", "submissions", questionId);
    await setDoc(progressRef, {
      ...result,
      studentAnswer,
      timestamp: Timestamp.now(),
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("AI Marking Route Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
