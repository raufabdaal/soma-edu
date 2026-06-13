import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { getGeminiResponse } from "@/lib/ai/gemini";
import { MARKING_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { PastPaperQuestion, TopicMarkingScheme } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { questionId, studentAnswer, studentId } = body;

    if (!questionId || !studentAnswer || !studentId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

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

    const aiResponse = await getGeminiResponse(studentAnswer, prompt);
    const cleanJson = aiResponse.replace(/```json/g, "").replace(/```/g, "").trim();
    const result = JSON.parse(cleanJson);

    const progressRef = doc(db, "students", studentId, "progress", "questions", "submissions", questionId);
    await setDoc(progressRef, {
      ...result,
      studentAnswer,
      timestamp: Timestamp.now(),
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("AI Marking Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
