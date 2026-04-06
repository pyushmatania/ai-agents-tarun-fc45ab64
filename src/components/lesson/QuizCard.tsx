import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Agni from "@/components/Agni";
import { SFX } from "@/lib/sounds";
import type { AgniExpression } from "@/components/Agni";

export type QuizType = "mcq" | "truefalse" | "fillin";

export interface QuizQuestion {
  type: QuizType;
  question: string;
  options?: string[];
  correctIndex?: number; // for mcq
  correctAnswer?: boolean; // for truefalse
  correctText?: string; // for fillin
  explanation: string;
}

interface QuizCardProps {
  quiz: QuizQuestion;
  onAnswer: (correct: boolean) => void;
}

const QuizCard = ({ quiz, onAnswer }: QuizCardProps) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [tfAnswer, setTfAnswer] = useState<boolean | null>(null);
  const [fillText, setFillText] = useState("");
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const checkAnswer = () => {
    let correct = false;
    if (quiz.type === "mcq" && selected !== null) {
      correct = selected === quiz.correctIndex;
    } else if (quiz.type === "truefalse" && tfAnswer !== null) {
      correct = tfAnswer === quiz.correctAnswer;
    } else if (quiz.type === "fillin" && fillText.trim()) {
      correct = fillText.trim().toLowerCase() === quiz.correctText?.toLowerCase();
    } else {
      return;
    }
    setIsCorrect(correct);
    setAnswered(true);
  };

  const handleContinue = () => {
    onAnswer(isCorrect);
  };

  const agniExpr: AgniExpression = !answered ? "thinking" : isCorrect ? "celebrating" : "sad";
  const agniSpeech = !answered ? "Think carefully! 🤔" : isCorrect ? "Correct! 🎉" : "Not quite... 😢";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -20 }}
      className="w-full h-full flex flex-col"
    >
      <div className="flex-1 bg-card border border-border/40 rounded-3xl p-5 flex flex-col">
        {/* Quiz tag */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[8px] font-black px-2 py-0.5 rounded-full text-agni-gold bg-agni-gold/15">
            QUIZ
          </span>
          <span className="text-[8px] font-bold text-muted-foreground uppercase">
            {quiz.type === "mcq" ? "Multiple Choice" : quiz.type === "truefalse" ? "True or False" : "Fill in the Blank"}
          </span>
        </div>

        {/* AGNI */}
        <div className="flex justify-center mb-3">
          <Agni expression={agniExpr} size={60} speech={agniSpeech} />
        </div>

        {/* Question */}
        <h3 className="text-base font-black text-foreground mb-4 leading-snug text-center">
          {quiz.question}
        </h3>

        {/* Answer area */}
        <div className="flex-1 flex flex-col gap-2">
          {quiz.type === "mcq" && quiz.options && (
            <>
              {quiz.options.map((opt, i) => {
                const isSelected = selected === i;
                const showResult = answered;
                const isCorrectOpt = i === quiz.correctIndex;
                return (
                  <motion.button
                    key={i}
                    whileTap={!answered ? { scale: 0.97 } : {}}
                    onClick={() => !answered && setSelected(i)}
                    disabled={answered}
                    className={`w-full text-left px-4 py-3 rounded-2xl border-2 text-sm font-bold transition-all ${
                      showResult
                        ? isCorrectOpt
                          ? "bg-agni-green/15 border-agni-green text-agni-green"
                          : isSelected
                            ? "bg-agni-pink/15 border-agni-pink text-agni-pink"
                            : "bg-muted/20 border-border/30 text-muted-foreground/50"
                        : isSelected
                          ? "bg-agni-blue/15 border-agni-blue text-foreground"
                          : "bg-card border-border/40 text-foreground hover:border-border"
                    }`}
                  >
                    <span className="mr-2 text-xs opacity-60">{String.fromCharCode(65 + i)}.</span>
                    {opt}
                  </motion.button>
                );
              })}
            </>
          )}

          {quiz.type === "truefalse" && (
            <div className="flex gap-3 justify-center">
              {[true, false].map((val) => {
                const isSelected = tfAnswer === val;
                const showResult = answered;
                const isCorrectVal = val === quiz.correctAnswer;
                return (
                  <motion.button
                    key={String(val)}
                    whileTap={!answered ? { scale: 0.93 } : {}}
                    onClick={() => !answered && setTfAnswer(val)}
                    disabled={answered}
                    className={`flex-1 py-4 rounded-2xl border-2 text-base font-black transition-all ${
                      showResult
                        ? isCorrectVal
                          ? "bg-agni-green/15 border-agni-green text-agni-green"
                          : isSelected
                            ? "bg-agni-pink/15 border-agni-pink text-agni-pink"
                            : "bg-muted/20 border-border/30 text-muted-foreground/50"
                        : isSelected
                          ? "bg-agni-blue/15 border-agni-blue text-foreground"
                          : "bg-card border-border/40 text-foreground"
                    }`}
                  >
                    {val ? "✅ True" : "❌ False"}
                  </motion.button>
                );
              })}
            </div>
          )}

          {quiz.type === "fillin" && (
            <div className="space-y-3">
              <input
                value={fillText}
                onChange={(e) => !answered && setFillText(e.target.value)}
                disabled={answered}
                placeholder="Type your answer..."
                className={`w-full px-4 py-3 rounded-2xl border-2 text-sm font-bold bg-card outline-none transition-all ${
                  answered
                    ? isCorrect
                      ? "border-agni-green text-agni-green"
                      : "border-agni-pink text-agni-pink"
                    : "border-border/40 text-foreground focus:border-agni-blue"
                }`}
                onKeyDown={(e) => e.key === "Enter" && !answered && checkAnswer()}
              />
              {answered && !isCorrect && (
                <p className="text-xs font-bold text-agni-green text-center">
                  Answer: {quiz.correctText}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Explanation after answering */}
        <AnimatePresence>
          {answered && (
            <motion.div
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              className={`mt-3 p-3 rounded-2xl text-xs font-medium leading-relaxed ${
                isCorrect ? "bg-agni-green/10 text-agni-green" : "bg-agni-pink/10 text-foreground/70"
              }`}
            >
              {quiz.explanation}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action button */}
        <motion.button
          whileTap={{ scale: 0.95, y: 2 }}
          onClick={answered ? handleContinue : checkAnswer}
          disabled={!answered && selected === null && tfAnswer === null && !fillText.trim()}
          className={`mt-4 w-full py-3.5 rounded-2xl font-black text-sm transition-all shadow-btn-3d active:shadow-btn-3d-pressed active:translate-y-0.5 disabled:opacity-30 ${
            answered
              ? isCorrect
                ? "bg-agni-green text-white"
                : "bg-agni-orange text-white"
              : "bg-agni-blue text-white"
          }`}
        >
          {answered ? (isCorrect ? "Continue ✨" : "Got It →") : "Check Answer"}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default QuizCard;
