"use client";

import { useState } from "react";
import { Lesson } from "@/types";
import { TextBlock, KeyPointBlock, ImageBlock } from "./ContentBlocks";
import { QuestionBlock } from "./QuestionBlock";
import { WorkedExampleBlock } from "./WorkedExampleBlock";

interface LessonPlayerProps {
  lesson: Lesson;
  onComplete: (score: number, answers: unknown[]) => void;
}

export function LessonPlayer({ lesson, onComplete }: LessonPlayerProps) {
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [answers, setAnswers] = useState<unknown[]>([]);
  const [scores, setScores] = useState<number[]>([]);

  const handleNext = () => {
    if (currentBlockIndex < lesson.blocks.length - 1) {
      setCurrentBlockIndex(currentBlockIndex + 1);
    } else {
      const totalScore = scores.reduce((a, b) => a + b, 0);
      const maxScore = lesson.blocks.filter(b => b.type === 'question').length;
      const finalPercentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 100;
      onComplete(finalPercentage, answers);
    }
  };

  const handleQuestionAnswer = (correct: boolean, answer: unknown) => {
    setAnswers([...answers, answer]);
    setScores([...scores, correct ? 1 : 0]);
  };

  const visibleBlocks = lesson.blocks.slice(0, currentBlockIndex + 1);

  return (
    <div className="max-w-3xl mx-auto pb-24">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b mb-8 py-4 px-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{lesson.title}</h2>
            <div className="w-full h-1.5 bg-muted rounded-full mt-2">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${((currentBlockIndex + 1) / lesson.blocks.length) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded">
            {currentBlockIndex + 1} / {lesson.blocks.length}
          </div>
        </div>
      </header>

      <div className="space-y-4">
        {visibleBlocks.map((block, index) => {
          const isLast = index === currentBlockIndex;

          switch (block.type) {
            case "text":
              return <TextBlock key={index} {...block} />;
            case "key_point":
              return <KeyPointBlock key={index} {...block} />;
            case "image":
              return <ImageBlock key={index} {...block} />;
            case "question":
              return (
                <QuestionBlock
                  key={index}
                  {...block}
                  onAnswer={(correct) => handleQuestionAnswer(correct, { blockIndex: index, correct })}
                  disabled={!isLast}
                />
              );
            case "worked_example":
              return <WorkedExampleBlock key={index} {...block} />;
            default:
              return null;
          }
        })}
      </div>

      {currentBlockIndex < lesson.blocks.length && (
        <div className="mt-12 flex justify-center">
          <button
            onClick={handleNext}
            className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-[0.98]"
          >
            {currentBlockIndex === lesson.blocks.length - 1 ? "Finish Lesson" : "Continue"}
          </button>
        </div>
      )}
    </div>
  );
}
