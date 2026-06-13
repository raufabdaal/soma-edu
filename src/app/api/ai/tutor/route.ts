import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { getAiResponse } from "@/lib/ai/nvidia";
import { TUTOR_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { TopicMarkingScheme } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, topicId, subjectId, conversationHistory } = body;

    if (!message || !topicId || !subjectId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const markingSchemeRef = doc(db, "markingSchemes", subjectId, "topics", topicId);
    const markingSchemeSnap = await getDoc(markingSchemeRef);

    let markingSchemeData: TopicMarkingScheme | null = null;
    if (markingSchemeSnap.exists()) {
      markingSchemeData = markingSchemeSnap.data() as TopicMarkingScheme;
    }

    const systemPrompt = TUTOR_SYSTEM_PROMPT
      .replace("{{SUBJECT}}", subjectId)
      .replace("{{LEVEL}}", "S3/S4")
      .replace("{{TOPIC_TITLE}}", topicId)
      .replace("{{GENERAL_GUIDANCE}}", markingSchemeData?.generalGuidance || "Standard UNEB curriculum guidance.")
      .replace("{{KEY_TERMS}}", markingSchemeData?.keyTerms.join(", ") || "N/A");

    const fullPrompt = conversationHistory
      ? `${JSON.stringify(conversationHistory)}\n\nUser: ${message}`
      : message;

    let reply;
    try {
      reply = await getAiResponse(fullPrompt, systemPrompt);
    } catch (apiError) {
      console.error("AI API Error:", apiError);
      reply = "I'm having a bit of trouble connecting to my knowledge base right now. Please try again in a moment!";
    }

    return NextResponse.json({ reply });
  } catch (error: unknown) {
    console.error("AI Tutor Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
