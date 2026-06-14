import { NextResponse } from "next/server";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

const sampleData = {
  subjects: [
    {
      id: "biology",
      title: "Biology",
      description: "UNEB O-Level Biology",
      icon: "dna",
      color: "bg-green-500",
    },
    {
      id: "chemistry",
      title: "Chemistry",
      description: "UNEB O-Level Chemistry",
      icon: "flask",
      color: "bg-blue-500",
    },
    {
      id: "mathematics",
      title: "Mathematics",
      description: "UNEB O-Level Mathematics",
      icon: "calculator",
      color: "bg-purple-500",
    },
  ],
  topics: {
    biology: [
      {
        id: "cell-biology",
        title: "Cell Biology",
        description: "Study of cells, their structure, and functions.",
        order: 1,
      },
    ],
    chemistry: [
      {
        id: "chemical-bonding",
        title: "Chemical Bonding",
        description: "How atoms bond to form molecules.",
        order: 1,
      },
    ],
    mathematics: [
      {
        id: "calculus-basics",
        title: "Calculus Basics",
        description: "Introduction to limits, derivatives, and integrals.",
        order: 1,
      },
    ],
  },
  lessons: {
    biology: {
      "cell-biology": [
        {
          id: "intro-to-cells",
          title: "Introduction to Cells",
          content: "Cells are the basic building blocks of all living things.",
          order: 1,
        },
      ],
    },
    chemistry: {
      "chemical-bonding": [
        {
          id: "ionic-bonding",
          title: "Ionic Bonding",
          content: "Ionic bonding is a type of chemical bonding that involves the electrostatic attraction between oppositely charged ions.",
          order: 1,
        },
      ],
    },
    mathematics: {
      "calculus-basics": [
        {
          id: "intro-to-limits",
          title: "Introduction to Limits",
          content: "A limit is the value that a function approaches as the input approaches some value.",
          order: 1,
        },
      ],
    },
  },
  questions: [
    {
      id: "q-bio-1",
      subjectId: "biology",
      topicId: "cell-biology",
      text: "Explain the function of the mitochondria in a cell.",
      marks: 4,
      markingScheme: "Mitochondria is the powerhouse of the cell. It generates most of the cell's supply of adenosine triphosphate (ATP), used as a source of chemical energy.",
      requiredKeywords: ["powerhouse", "ATP", "energy"],
    },
    {
      id: "q-chem-1",
      subjectId: "chemistry",
      topicId: "chemical-bonding",
      text: "Describe the process of ionic bonding.",
      marks: 5,
      markingScheme: "Ionic bonding involves the transfer of electrons from one atom to another, resulting in the formation of positive and negative ions which are then attracted to each other.",
      requiredKeywords: ["transfer", "electrons", "ions", "attracted"],
    },
    {
      id: "q-math-1",
      subjectId: "mathematics",
      topicId: "calculus-basics",
      text: "What is a limit in calculus?",
      marks: 3,
      markingScheme: "A limit tells us the value that a function approaches as that function's inputs get closer and closer to some number.",
      requiredKeywords: ["approaches", "closer", "value"],
    },
  ],
  markingSchemes: {
    biology: {
      "cell-biology": {
        topicId: "cell-biology",
        generalGuidance: "Ensure students understand the distinct functions of different organelles.",
        keyTerms: ["nucleus", "mitochondria", "ribosomes", "cell membrane"],
        commonMistakes: ["Confusing plant and animal cells", "Misunderstanding the role of the nucleus"],
      },
    },
    chemistry: {
      "chemical-bonding": {
        topicId: "chemical-bonding",
        generalGuidance: "Students must clearly distinguish between ionic and covalent bonding.",
        keyTerms: ["electrons", "transfer", "sharing", "ions", "covalent"],
        commonMistakes: ["Saying electrons are shared in ionic bonds", "Forgetting charge signs on ions"],
      },
    },
    mathematics: {
      "calculus-basics": {
        topicId: "calculus-basics",
        generalGuidance: "Focus on the concept of approaching a value without necessarily reaching it.",
        keyTerms: ["limit", "approach", "infinity", "undefined"],
        commonMistakes: ["Plugging in the value directly when it results in division by zero"],
      },
    },
  },
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");

  // Basic security check to prevent unauthorized seeding
  if (secret !== (process.env.ADMIN_SECRET || "somaedu123")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Seed Subjects
    for (const subject of sampleData.subjects) {
      await setDoc(doc(db, "subjects", subject.id), subject);
    }

    // 2. Seed Topics
    for (const [subjectId, topics] of Object.entries(sampleData.topics)) {
      for (const topic of topics) {
        await setDoc(doc(db, "subjects", subjectId, "topics", topic.id), topic);
      }
    }

    // 3. Seed Lessons
    for (const [subjectId, topics] of Object.entries(sampleData.lessons)) {
      for (const [topicId, lessons] of Object.entries(topics)) {
        for (const lesson of lessons) {
          await setDoc(doc(db, "subjects", subjectId, "topics", topicId, "lessons", lesson.id), lesson);
        }
      }
    }

    // 4. Seed Questions
    for (const question of sampleData.questions) {
      await setDoc(doc(db, "questions", question.id), question);
    }

    // 5. Seed Marking Schemes
    for (const [subjectId, topics] of Object.entries(sampleData.markingSchemes)) {
      for (const [topicId, scheme] of Object.entries(topics)) {
        await setDoc(doc(db, "markingSchemes", subjectId, "topics", topicId), scheme);
      }
    }

    return NextResponse.json({ success: true, message: "Database seeded successfully with UNEB sample data." });
  } catch (error: unknown) {
    console.error("Error seeding database:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
