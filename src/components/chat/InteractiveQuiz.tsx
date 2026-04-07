import { useState, useCallback } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { SFX } from "@/lib/sounds";

// ==================== QUIZ TYPES ====================

export type QuizVariant =
  | "mcq" | "truefalse" | "fillin" | "slider" | "match"
  | "dragdrop" | "codefill" | "hotspot" | "wordbank"
  | "rating" | "categorize" | "flashcard" | "audio"
  | "emoji" | "speedround";

export interface QuizData {
  type: QuizVariant;
  question: string;
  difficulty?: "easy" | "medium" | "hard";
  // MCQ
  options?: string[];
  correctIndex?: number;
  // True/False
  correctAnswer?: boolean;
  // Fill-in / CodeFill
  correctText?: string;
  placeholder?: string;
  // Slider
  min?: number;
  max?: number;
  correctValue?: number;
  unit?: string;
  // Match
  leftItems?: string[];
  rightItems?: string[];
  correctPairs?: number[]; // index mapping left->right
  // DragDrop
  items?: string[];
  correctOrder?: number[];
  // WordBank
  sentence?: string; // with ___ blanks
  words?: string[];
  correctWords?: string[];
  // Rating
  statements?: { text: string; correct: "agree" | "disagree" | "neutral" }[];
  // Categorize
  categories?: { name: string; items: string[] }[];
  allItems?: string[];
  // Flashcard
  front?: string;
  back?: string;
  // Emoji
  emojiOptions?: { emoji: string; label: string }[];
  correctEmoji?: string;
  // SpeedRound
  questions?: { q: string; a: string }[];
  timePerQuestion?: number;
  // Common
  explanation: string;
  hint?: string;
}

interface InteractiveQuizProps {
  quiz: QuizData;
  onAnswer: (correct: boolean) => void;
}

// ==================== DIFFICULTY BADGE ====================
function DifficultyBadge({ difficulty }: { difficulty?: string }) {
  if (!difficulty) return null;
  const cfg = {
    easy: { label: "🟢 EASY", cls: "text-agni-green bg-agni-green/15" },
    medium: { label: "🟡 MEDIUM", cls: "text-agni-orange bg-agni-orange/15" },
    hard: { label: "🔴 HARD", cls: "text-agni-pink bg-agni-pink/15" },
  }[difficulty] || { label: difficulty, cls: "text-muted-foreground bg-muted/15" };
  return <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${cfg.cls}`}>{cfg.label}</span>;
}

// ==================== RESULT FOOTER ====================
function ResultFooter({ isCorrect, explanation, onContinue }: { isCorrect: boolean; explanation: string; onContinue: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className={`p-4 rounded-2xl text-[12px] font-medium leading-relaxed mb-4 ${
        isCorrect ? "bg-agni-green/10 text-agni-green" : "bg-agni-pink/10 text-foreground/70"
      }`}>
        <span className="font-black">{isCorrect ? "🎉 Correct!" : "😢 Not quite..."}</span>
        <p className="mt-1">{explanation}</p>
      </div>
      <motion.button
        whileTap={{ scale: 0.95, y: 2 }}
        onClick={onContinue}
        className={`w-full py-4 rounded-2xl font-black text-sm transition-all ${
          isCorrect ? "bg-agni-green text-white" : "bg-agni-orange text-white"
        }`}
      >
        {isCorrect ? "Continue ✨" : "Got It →"}
      </motion.button>
    </motion.div>
  );
}

// ==================== MCQ ====================
function MCQQuiz({ quiz, onAnswer }: InteractiveQuizProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const isCorrect = selected === quiz.correctIndex;

  const check = () => {
    if (selected === null) return;
    setAnswered(true);
    isCorrect ? SFX.success() : SFX.error();
  };

  return (
    <div className="space-y-3">
      {quiz.options?.map((opt, i) => {
        const isSel = selected === i;
        const correct = i === quiz.correctIndex;
        return (
          <motion.button
            key={i} whileTap={!answered ? { scale: 0.97 } : {}}
            onClick={() => !answered && setSelected(i)}
            className={`w-full text-left px-5 py-4 rounded-2xl border-2 text-[13px] font-bold transition-all ${
              answered
                ? correct ? "bg-agni-green/15 border-agni-green text-agni-green"
                  : isSel ? "bg-agni-pink/15 border-agni-pink text-agni-pink"
                  : "bg-muted/10 border-border/20 text-muted-foreground/40"
                : isSel ? "bg-agni-blue/15 border-agni-blue text-foreground"
                  : "bg-card border-border/30 text-foreground hover:border-border/60"
            }`}
          >
            <span className="mr-2.5 text-[11px] opacity-50 font-black">{String.fromCharCode(65 + i)}</span>
            {opt}
          </motion.button>
        );
      })}
      {!answered ? (
        <motion.button whileTap={{ scale: 0.95 }} onClick={check} disabled={selected === null}
          className="w-full py-4 rounded-2xl bg-agni-blue text-white font-black text-sm disabled:opacity-30">
          Check Answer
        </motion.button>
      ) : (
        <ResultFooter isCorrect={isCorrect} explanation={quiz.explanation} onContinue={() => onAnswer(isCorrect)} />
      )}
    </div>
  );
}

// ==================== TRUE/FALSE ====================
function TrueFalseQuiz({ quiz, onAnswer }: InteractiveQuizProps) {
  const [selected, setSelected] = useState<boolean | null>(null);
  const [answered, setAnswered] = useState(false);
  const isCorrect = selected === quiz.correctAnswer;

  const check = () => {
    if (selected === null) return;
    setAnswered(true);
    isCorrect ? SFX.success() : SFX.error();
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {[true, false].map(val => {
          const isSel = selected === val;
          const correct = val === quiz.correctAnswer;
          return (
            <motion.button key={String(val)} whileTap={!answered ? { scale: 0.93 } : {}}
              onClick={() => !answered && setSelected(val)}
              className={`py-5 rounded-2xl border-2 text-base font-black transition-all ${
                answered
                  ? correct ? "bg-agni-green/15 border-agni-green text-agni-green"
                    : isSel ? "bg-agni-pink/15 border-agni-pink text-agni-pink"
                    : "bg-muted/10 border-border/20 text-muted-foreground/40"
                  : isSel ? "bg-agni-blue/15 border-agni-blue text-foreground"
                    : "bg-card border-border/30 text-foreground"
              }`}
            >
              {val ? "✅ True" : "❌ False"}
            </motion.button>
          );
        })}
      </div>
      {!answered ? (
        <motion.button whileTap={{ scale: 0.95 }} onClick={check} disabled={selected === null}
          className="w-full py-4 rounded-2xl bg-agni-blue text-white font-black text-sm disabled:opacity-30">
          Check Answer
        </motion.button>
      ) : (
        <ResultFooter isCorrect={isCorrect} explanation={quiz.explanation} onContinue={() => onAnswer(isCorrect)} />
      )}
    </div>
  );
}

// ==================== FILL IN THE BLANK ====================
function FillInQuiz({ quiz, onAnswer }: InteractiveQuizProps) {
  const [text, setText] = useState("");
  const [answered, setAnswered] = useState(false);
  const isCorrect = text.trim().toLowerCase() === quiz.correctText?.toLowerCase();

  const check = () => {
    if (!text.trim()) return;
    setAnswered(true);
    isCorrect ? SFX.success() : SFX.error();
  };

  return (
    <div className="space-y-3">
      <input value={text} onChange={e => !answered && setText(e.target.value)}
        placeholder={quiz.placeholder || "Type your answer..."}
        onKeyDown={e => e.key === "Enter" && check()}
        className={`w-full px-5 py-4 rounded-2xl border-2 text-[14px] font-bold bg-card outline-none transition-all ${
          answered ? isCorrect ? "border-agni-green text-agni-green" : "border-agni-pink text-agni-pink"
            : "border-border/30 text-foreground focus:border-agni-blue"
        }`}
      />
      {answered && !isCorrect && (
        <p className="text-[12px] font-bold text-agni-green text-center">Correct answer: {quiz.correctText}</p>
      )}
      {!answered ? (
        <motion.button whileTap={{ scale: 0.95 }} onClick={check} disabled={!text.trim()}
          className="w-full py-4 rounded-2xl bg-agni-blue text-white font-black text-sm disabled:opacity-30">
          Check Answer
        </motion.button>
      ) : (
        <ResultFooter isCorrect={isCorrect} explanation={quiz.explanation} onContinue={() => onAnswer(isCorrect)} />
      )}
    </div>
  );
}

// ==================== SLIDER ====================
function SliderQuiz({ quiz, onAnswer }: InteractiveQuizProps) {
  const min = quiz.min ?? 0;
  const max = quiz.max ?? 100;
  const [value, setValue] = useState(Math.round((min + max) / 2));
  const [answered, setAnswered] = useState(false);
  const tolerance = Math.max(1, Math.round((max - min) * 0.1));
  const isCorrect = Math.abs(value - (quiz.correctValue ?? 0)) <= tolerance;

  const check = () => { setAnswered(true); isCorrect ? SFX.success() : SFX.error(); };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <span className="text-3xl font-black text-foreground">{value}</span>
        {quiz.unit && <span className="text-sm font-bold text-muted-foreground ml-1">{quiz.unit}</span>}
      </div>
      <div className="px-2">
        <input type="range" min={min} max={max} value={value}
          onChange={e => !answered && setValue(Number(e.target.value))}
          className="w-full h-3 rounded-full appearance-none bg-muted/30 accent-agni-blue cursor-pointer [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-agni-blue [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white"
        />
        <div className="flex justify-between text-[10px] font-bold text-muted-foreground mt-1">
          <span>{min}</span><span>{max}</span>
        </div>
      </div>
      {answered && !isCorrect && (
        <p className="text-[12px] font-bold text-agni-green text-center">Correct: {quiz.correctValue} {quiz.unit}</p>
      )}
      {!answered ? (
        <motion.button whileTap={{ scale: 0.95 }} onClick={check}
          className="w-full py-4 rounded-2xl bg-agni-blue text-white font-black text-sm">
          Lock In Answer
        </motion.button>
      ) : (
        <ResultFooter isCorrect={isCorrect} explanation={quiz.explanation} onContinue={() => onAnswer(isCorrect)} />
      )}
    </div>
  );
}

// ==================== MATCH COLUMNS ====================
function MatchQuiz({ quiz, onAnswer }: InteractiveQuizProps) {
  const left = quiz.leftItems || [];
  const right = quiz.rightItems || [];
  const [selected, setSelected] = useState<{ left: number | null; right: number | null }>({ left: null, right: null });
  const [pairs, setPairs] = useState<[number, number][]>([]);
  const [answered, setAnswered] = useState(false);

  const handleLeftClick = (i: number) => {
    if (answered || pairs.some(p => p[0] === i)) return;
    setSelected(prev => ({ ...prev, left: i }));
    if (selected.right !== null) {
      setPairs(prev => [...prev, [i, selected.right!]]);
      setSelected({ left: null, right: null });
    }
  };

  const handleRightClick = (i: number) => {
    if (answered || pairs.some(p => p[1] === i)) return;
    setSelected(prev => ({ ...prev, right: i }));
    if (selected.left !== null) {
      setPairs(prev => [...prev, [selected.left!, i]]);
      setSelected({ left: null, right: null });
    }
  };

  const correctPairs = quiz.correctPairs || [];
  const allCorrect = pairs.length === left.length && pairs.every(([l, r]) => correctPairs[l] === r);

  const check = () => {
    if (pairs.length < left.length) return;
    setAnswered(true);
    allCorrect ? SFX.success() : SFX.error();
  };

  const isPairCorrect = (l: number, r: number) => correctPairs[l] === r;

  return (
    <div className="space-y-4">
      <p className="text-[11px] text-muted-foreground text-center">Tap one item from each column to match</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          {left.map((item, i) => {
            const paired = pairs.find(p => p[0] === i);
            const isSelected = selected.left === i;
            return (
              <motion.button key={i} whileTap={{ scale: 0.95 }} onClick={() => handleLeftClick(i)}
                className={`w-full text-left px-3 py-3 rounded-xl border-2 text-[11px] font-bold transition-all ${
                  answered && paired ? isPairCorrect(paired[0], paired[1]) ? "border-agni-green bg-agni-green/10 text-agni-green" : "border-agni-pink bg-agni-pink/10 text-agni-pink"
                    : paired ? "border-agni-blue/40 bg-agni-blue/5 text-foreground/70"
                    : isSelected ? "border-agni-blue bg-agni-blue/10 text-foreground"
                    : "border-border/30 bg-card text-foreground"
                }`}
              >{item}</motion.button>
            );
          })}
        </div>
        <div className="space-y-2">
          {right.map((item, i) => {
            const paired = pairs.find(p => p[1] === i);
            const isSelected = selected.right === i;
            return (
              <motion.button key={i} whileTap={{ scale: 0.95 }} onClick={() => handleRightClick(i)}
                className={`w-full text-left px-3 py-3 rounded-xl border-2 text-[11px] font-bold transition-all ${
                  answered && paired ? isPairCorrect(paired[0], paired[1]) ? "border-agni-green bg-agni-green/10 text-agni-green" : "border-agni-pink bg-agni-pink/10 text-agni-pink"
                    : paired ? "border-agni-blue/40 bg-agni-blue/5 text-foreground/70"
                    : isSelected ? "border-agni-blue bg-agni-blue/10 text-foreground"
                    : "border-border/30 bg-card text-foreground"
                }`}
              >{item}</motion.button>
            );
          })}
        </div>
      </div>
      {pairs.length > 0 && !answered && (
        <button onClick={() => { setPairs([]); setSelected({ left: null, right: null }); }}
          className="text-[10px] font-bold text-muted-foreground underline mx-auto block">Reset</button>
      )}
      {!answered ? (
        <motion.button whileTap={{ scale: 0.95 }} onClick={check} disabled={pairs.length < left.length}
          className="w-full py-4 rounded-2xl bg-agni-blue text-white font-black text-sm disabled:opacity-30">
          Check Matches
        </motion.button>
      ) : (
        <ResultFooter isCorrect={allCorrect} explanation={quiz.explanation} onContinue={() => onAnswer(allCorrect)} />
      )}
    </div>
  );
}

// ==================== DRAG & DROP ORDER ====================
function DragDropQuiz({ quiz, onAnswer }: InteractiveQuizProps) {
  const items = quiz.items || [];
  const correctOrder = quiz.correctOrder || items.map((_, i) => i);
  const [order, setOrder] = useState(() => [...items].sort(() => Math.random() - 0.5));
  const [answered, setAnswered] = useState(false);

  const isCorrect = order.every((item, i) => items[correctOrder[i]] === item);

  const moveItem = (from: number, to: number) => {
    if (answered) return;
    const newOrder = [...order];
    const [moved] = newOrder.splice(from, 1);
    newOrder.splice(to, 0, moved);
    setOrder(newOrder);
  };

  const check = () => { setAnswered(true); isCorrect ? SFX.success() : SFX.error(); };

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-muted-foreground text-center">Tap arrows to reorder</p>
      {order.map((item, i) => {
        const correctPos = correctOrder.indexOf(items.indexOf(item));
        return (
          <motion.div key={item} layout
            className={`flex items-center gap-2 px-4 py-3.5 rounded-2xl border-2 transition-all ${
              answered ? i === correctPos ? "border-agni-green bg-agni-green/10" : "border-agni-pink bg-agni-pink/10"
                : "border-border/30 bg-card"
            }`}
          >
            <span className="text-[10px] font-black text-muted-foreground w-5">{i + 1}.</span>
            <span className="flex-1 text-[12px] font-bold text-foreground">{item}</span>
            {!answered && (
              <div className="flex flex-col gap-0.5">
                <button onClick={() => i > 0 && moveItem(i, i - 1)}
                  className="text-[10px] text-muted-foreground hover:text-foreground px-1">▲</button>
                <button onClick={() => i < order.length - 1 && moveItem(i, i + 1)}
                  className="text-[10px] text-muted-foreground hover:text-foreground px-1">▼</button>
              </div>
            )}
          </motion.div>
        );
      })}
      {!answered ? (
        <motion.button whileTap={{ scale: 0.95 }} onClick={check}
          className="w-full py-4 rounded-2xl bg-agni-blue text-white font-black text-sm">
          Check Order
        </motion.button>
      ) : (
        <ResultFooter isCorrect={isCorrect} explanation={quiz.explanation} onContinue={() => onAnswer(isCorrect)} />
      )}
    </div>
  );
}

// ==================== CODE FILL ====================
function CodeFillQuiz({ quiz, onAnswer }: InteractiveQuizProps) {
  const [text, setText] = useState("");
  const [answered, setAnswered] = useState(false);
  const isCorrect = text.trim().toLowerCase() === quiz.correctText?.toLowerCase();

  const check = () => { if (!text.trim()) return; setAnswered(true); isCorrect ? SFX.success() : SFX.error(); };

  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-[#0D1117] border border-border/20 p-4">
        <pre className="text-[12px] font-mono text-foreground/80 leading-relaxed whitespace-pre-wrap">
          {quiz.question.split("___").map((part, i, arr) => (
            <span key={i}>
              {part}
              {i < arr.length - 1 && (
                <input value={text} onChange={e => !answered && setText(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && check()}
                  className={`inline-block w-32 px-2 py-1 mx-1 rounded-lg border-2 text-[12px] font-mono bg-transparent outline-none ${
                    answered ? isCorrect ? "border-agni-green text-agni-green" : "border-agni-pink text-agni-pink"
                      : "border-agni-blue/50 text-agni-blue focus:border-agni-blue"
                  }`}
                  placeholder="???"
                />
              )}
            </span>
          ))}
        </pre>
      </div>
      {answered && !isCorrect && (
        <p className="text-[12px] font-bold text-agni-green text-center">Answer: <code className="bg-muted/30 px-1.5 py-0.5 rounded">{quiz.correctText}</code></p>
      )}
      {!answered ? (
        <motion.button whileTap={{ scale: 0.95 }} onClick={check} disabled={!text.trim()}
          className="w-full py-4 rounded-2xl bg-agni-blue text-white font-black text-sm disabled:opacity-30">
          Run Code ▶
        </motion.button>
      ) : (
        <ResultFooter isCorrect={isCorrect} explanation={quiz.explanation} onContinue={() => onAnswer(isCorrect)} />
      )}
    </div>
  );
}

// ==================== WORD BANK ====================
function WordBankQuiz({ quiz, onAnswer }: InteractiveQuizProps) {
  const words = quiz.words || [];
  const correctWords = quiz.correctWords || [];
  const blanks = (quiz.sentence || "").split("___");
  const [filled, setFilled] = useState<(string | null)[]>(new Array(blanks.length - 1).fill(null));
  const [answered, setAnswered] = useState(false);
  const isCorrect = filled.every((w, i) => w?.toLowerCase() === correctWords[i]?.toLowerCase());

  const availableWords = words.filter(w => !filled.includes(w));

  const fillNext = (word: string) => {
    if (answered) return;
    const idx = filled.indexOf(null);
    if (idx === -1) return;
    setFilled(prev => { const n = [...prev]; n[idx] = word; return n; });
  };

  const clearSlot = (idx: number) => {
    if (answered) return;
    setFilled(prev => { const n = [...prev]; n[idx] = null; return n; });
  };

  const check = () => {
    if (filled.includes(null)) return;
    setAnswered(true);
    isCorrect ? SFX.success() : SFX.error();
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-card border border-border/30 text-[13px] font-medium text-foreground leading-relaxed flex flex-wrap items-center gap-1">
        {blanks.map((part, i) => (
          <span key={i}>
            {part}
            {i < blanks.length - 1 && (
              <button onClick={() => clearSlot(i)}
                className={`inline-flex items-center justify-center min-w-[60px] px-3 py-1.5 mx-1 rounded-xl border-2 text-[12px] font-bold transition-all ${
                  filled[i]
                    ? answered
                      ? filled[i]?.toLowerCase() === correctWords[i]?.toLowerCase()
                        ? "border-agni-green bg-agni-green/10 text-agni-green"
                        : "border-agni-pink bg-agni-pink/10 text-agni-pink"
                      : "border-agni-blue bg-agni-blue/10 text-agni-blue"
                    : "border-dashed border-muted-foreground/30 text-muted-foreground/40"
                }`}
              >
                {filled[i] || "___"}
              </button>
            )}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {words.map(word => (
          <motion.button key={word} whileTap={{ scale: 0.9 }}
            onClick={() => fillNext(word)}
            disabled={answered || !availableWords.includes(word)}
            className={`px-4 py-2 rounded-xl border-2 text-[12px] font-bold transition-all ${
              availableWords.includes(word) && !answered
                ? "border-border/40 bg-card text-foreground hover:border-agni-blue"
                : "border-border/10 bg-muted/10 text-muted-foreground/30"
            }`}
          >{word}</motion.button>
        ))}
      </div>
      {!answered ? (
        <motion.button whileTap={{ scale: 0.95 }} onClick={check} disabled={filled.includes(null)}
          className="w-full py-4 rounded-2xl bg-agni-blue text-white font-black text-sm disabled:opacity-30">
          Check Answer
        </motion.button>
      ) : (
        <ResultFooter isCorrect={isCorrect} explanation={quiz.explanation} onContinue={() => onAnswer(isCorrect)} />
      )}
    </div>
  );
}

// ==================== RATING SCALE ====================
function RatingQuiz({ quiz, onAnswer }: InteractiveQuizProps) {
  const statements = quiz.statements || [];
  const [ratings, setRatings] = useState<Record<number, string>>({});
  const [answered, setAnswered] = useState(false);
  const allCorrect = statements.every((s, i) => ratings[i] === s.correct);

  const check = () => {
    if (Object.keys(ratings).length < statements.length) return;
    setAnswered(true);
    allCorrect ? SFX.success() : SFX.error();
  };

  return (
    <div className="space-y-3">
      {statements.map((s, i) => (
        <div key={i} className={`p-4 rounded-2xl border-2 transition-all ${
          answered ? ratings[i] === s.correct ? "border-agni-green bg-agni-green/5" : "border-agni-pink bg-agni-pink/5"
            : "border-border/30 bg-card"
        }`}>
          <p className="text-[12px] font-bold text-foreground mb-3">{s.text}</p>
          <div className="flex gap-2">
            {["agree", "neutral", "disagree"].map(val => (
              <button key={val} onClick={() => !answered && setRatings(prev => ({ ...prev, [i]: val }))}
                className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${
                  ratings[i] === val
                    ? "bg-agni-blue/15 border-2 border-agni-blue text-agni-blue"
                    : "bg-muted/10 border-2 border-transparent text-muted-foreground"
                }`}
              >
                {val === "agree" ? "👍 Agree" : val === "neutral" ? "🤷 Neutral" : "👎 Disagree"}
              </button>
            ))}
          </div>
        </div>
      ))}
      {!answered ? (
        <motion.button whileTap={{ scale: 0.95 }} onClick={check}
          disabled={Object.keys(ratings).length < statements.length}
          className="w-full py-4 rounded-2xl bg-agni-blue text-white font-black text-sm disabled:opacity-30">
          Check Answers
        </motion.button>
      ) : (
        <ResultFooter isCorrect={allCorrect} explanation={quiz.explanation} onContinue={() => onAnswer(allCorrect)} />
      )}
    </div>
  );
}

// ==================== CATEGORIZE ====================
function CategorizeQuiz({ quiz, onAnswer }: InteractiveQuizProps) {
  const categories = quiz.categories || [];
  const allItems = quiz.allItems || categories.flatMap(c => c.items);
  const [placed, setPlaced] = useState<Record<string, string[]>>(() => {
    const init: Record<string, string[]> = {};
    categories.forEach(c => init[c.name] = []);
    return init;
  });
  const [answered, setAnswered] = useState(false);

  const unplaced = allItems.filter(item => !Object.values(placed).flat().includes(item));

  const placeItem = (item: string, catName: string) => {
    if (answered) return;
    setPlaced(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => { next[k] = next[k].filter(i => i !== item); });
      next[catName] = [...next[catName], item];
      return next;
    });
  };

  const isCorrect = categories.every(cat =>
    cat.items.every(item => placed[cat.name]?.includes(item)) && placed[cat.name]?.length === cat.items.length
  );

  const check = () => {
    if (unplaced.length > 0) return;
    setAnswered(true);
    isCorrect ? SFX.success() : SFX.error();
  };

  return (
    <div className="space-y-3">
      {unplaced.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-muted/10 border border-border/20">
          {unplaced.map(item => (
            <span key={item} className="px-3 py-1.5 rounded-xl bg-card border border-border/30 text-[11px] font-bold text-foreground">
              {item}
            </span>
          ))}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        {categories.map(cat => (
          <div key={cat.name} className={`rounded-2xl border-2 p-3 min-h-[100px] transition-all ${
            answered ? placed[cat.name]?.every(i => cat.items.includes(i)) && placed[cat.name]?.length === cat.items.length
              ? "border-agni-green bg-agni-green/5" : "border-agni-pink bg-agni-pink/5"
              : "border-border/30 bg-card/50"
          }`}>
            <h5 className="text-[10px] font-black text-foreground/70 mb-2">{cat.name}</h5>
            <div className="space-y-1">
              {placed[cat.name]?.map(item => (
                <span key={item} className="block text-[10px] font-bold text-foreground bg-muted/20 px-2 py-1 rounded-lg">{item}</span>
              ))}
            </div>
            {!answered && unplaced.length > 0 && (
              <div className="mt-2 space-y-1">
                {unplaced.map(item => (
                  <button key={item} onClick={() => placeItem(item, cat.name)}
                    className="block w-full text-left text-[9px] font-bold text-muted-foreground/50 hover:text-foreground px-2 py-1 rounded transition-colors">
                    + {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      {!answered ? (
        <motion.button whileTap={{ scale: 0.95 }} onClick={check} disabled={unplaced.length > 0}
          className="w-full py-4 rounded-2xl bg-agni-blue text-white font-black text-sm disabled:opacity-30">
          Check Categories
        </motion.button>
      ) : (
        <ResultFooter isCorrect={isCorrect} explanation={quiz.explanation} onContinue={() => onAnswer(isCorrect)} />
      )}
    </div>
  );
}

// ==================== FLASHCARD ====================
function FlashcardQuiz({ quiz, onAnswer }: InteractiveQuizProps) {
  const [flipped, setFlipped] = useState(false);
  const [selfGrade, setSelfGrade] = useState<boolean | null>(null);

  return (
    <div className="space-y-4">
      <motion.div
        onClick={() => !flipped && setFlipped(true)}
        className="relative w-full aspect-[4/3] cursor-pointer perspective-1000"
        style={{ perspective: "1000px" }}
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5 }}
          className="w-full h-full relative"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Front */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-agni-purple/20 to-agni-blue/20 border border-agni-purple/30 flex flex-col items-center justify-center p-6 backface-hidden"
            style={{ backfaceVisibility: "hidden" }}>
            <span className="text-[9px] font-black text-agni-purple uppercase tracking-wider mb-3">Tap to flip</span>
            <h3 className="text-lg font-black text-foreground text-center leading-snug">{quiz.front || quiz.question}</h3>
          </div>
          {/* Back */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-agni-green/20 to-agni-blue/10 border border-agni-green/30 flex flex-col items-center justify-center p-6"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
            <span className="text-[9px] font-black text-agni-green uppercase tracking-wider mb-3">Answer</span>
            <p className="text-[14px] font-bold text-foreground text-center leading-relaxed">{quiz.back || quiz.explanation}</p>
          </div>
        </motion.div>
      </motion.div>
      {flipped && selfGrade === null && (
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-muted-foreground text-center">Did you know this?</p>
          <div className="grid grid-cols-2 gap-3">
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setSelfGrade(true); SFX.success(); }}
              className="py-4 rounded-2xl bg-agni-green text-white font-black text-sm">
              ✅ I knew it!
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setSelfGrade(false); SFX.error(); }}
              className="py-4 rounded-2xl bg-agni-orange text-white font-black text-sm">
              📝 Need review
            </motion.button>
          </div>
        </div>
      )}
      {selfGrade !== null && (
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => onAnswer(selfGrade!)}
          className="w-full py-4 rounded-2xl bg-agni-blue text-white font-black text-sm">
          Continue →
        </motion.button>
      )}
    </div>
  );
}

// ==================== EMOJI REACT ====================
function EmojiQuiz({ quiz, onAnswer }: InteractiveQuizProps) {
  const emojiOptions = quiz.emojiOptions || [
    { emoji: "✅", label: "Correct" },
    { emoji: "❌", label: "Wrong" },
    { emoji: "🤔", label: "Partially" },
  ];
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const isCorrect = selected === quiz.correctEmoji;

  const check = () => {
    if (!selected) return;
    setAnswered(true);
    isCorrect ? SFX.success() : SFX.error();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-4">
        {emojiOptions.map(opt => (
          <motion.button key={opt.emoji} whileTap={{ scale: 0.85 }} whileHover={{ scale: 1.1 }}
            onClick={() => !answered && setSelected(opt.emoji)}
            className={`flex flex-col items-center gap-1.5 p-4 rounded-2xl border-2 transition-all ${
              answered
                ? opt.emoji === quiz.correctEmoji ? "border-agni-green bg-agni-green/10"
                  : selected === opt.emoji ? "border-agni-pink bg-agni-pink/10"
                  : "border-border/10 opacity-30"
                : selected === opt.emoji ? "border-agni-blue bg-agni-blue/10"
                : "border-border/30 bg-card"
            }`}
          >
            <span className="text-3xl">{opt.emoji}</span>
            <span className="text-[9px] font-bold text-muted-foreground">{opt.label}</span>
          </motion.button>
        ))}
      </div>
      {!answered ? (
        <motion.button whileTap={{ scale: 0.95 }} onClick={check} disabled={!selected}
          className="w-full py-4 rounded-2xl bg-agni-blue text-white font-black text-sm disabled:opacity-30">
          Submit
        </motion.button>
      ) : (
        <ResultFooter isCorrect={isCorrect} explanation={quiz.explanation} onContinue={() => onAnswer(isCorrect)} />
      )}
    </div>
  );
}

// ==================== SPEED ROUND ====================
function SpeedRoundQuiz({ quiz, onAnswer }: InteractiveQuizProps) {
  const questions = quiz.questions || [];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [done, setDone] = useState(false);
  const timePerQ = quiz.timePerQuestion || 10;
  const [timeLeft, setTimeLeft] = useState(timePerQ);

  const submitAnswer = () => {
    const newAnswers = [...answers, input.trim()];
    setAnswers(newAnswers);
    setInput("");
    if (currentIdx >= questions.length - 1) {
      setDone(true);
      const score = newAnswers.filter((a, i) => a.toLowerCase() === questions[i].a.toLowerCase()).length;
      score >= questions.length / 2 ? SFX.success() : SFX.error();
    } else {
      setCurrentIdx(prev => prev + 1);
      setTimeLeft(timePerQ);
    }
  };

  const score = done ? answers.filter((a, i) => a.toLowerCase() === questions[i]?.a.toLowerCase()).length : 0;
  const isCorrect = score >= questions.length / 2;

  if (done) {
    return (
      <div className="space-y-4">
        <div className="text-center py-6">
          <span className="text-4xl">{isCorrect ? "🎉" : "😅"}</span>
          <h3 className="text-xl font-black text-foreground mt-2">{score}/{questions.length}</h3>
          <p className="text-[12px] text-muted-foreground">questions correct</p>
        </div>
        <div className="space-y-2">
          {questions.map((q, i) => (
            <div key={i} className={`px-4 py-2 rounded-xl text-[11px] font-bold ${
              answers[i]?.toLowerCase() === q.a.toLowerCase() ? "bg-agni-green/10 text-agni-green" : "bg-agni-pink/10 text-foreground/70"
            }`}>
              {q.q} → <span className="font-black">{q.a}</span>
              {answers[i]?.toLowerCase() !== q.a.toLowerCase() && (
                <span className="text-agni-pink ml-1">(you: {answers[i] || "—"})</span>
              )}
            </div>
          ))}
        </div>
        <ResultFooter isCorrect={isCorrect} explanation={quiz.explanation} onContinue={() => onAnswer(isCorrect)} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black text-muted-foreground">{currentIdx + 1}/{questions.length}</span>
        <span className="text-[10px] font-black text-agni-orange">⚡ Speed Round</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-muted/20">
        <div className="h-full rounded-full bg-agni-blue transition-all" style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }} />
      </div>
      <h4 className="text-base font-black text-foreground text-center py-4">{questions[currentIdx]?.q}</h4>
      <input value={input} onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === "Enter" && submitAnswer()}
        placeholder="Quick answer..." autoFocus
        className="w-full px-5 py-4 rounded-2xl border-2 border-border/30 text-[14px] font-bold bg-card text-foreground outline-none focus:border-agni-blue"
      />
      <motion.button whileTap={{ scale: 0.95 }} onClick={submitAnswer}
        className="w-full py-4 rounded-2xl bg-agni-blue text-white font-black text-sm">
        {currentIdx < questions.length - 1 ? "Next ⚡" : "Finish!"}
      </motion.button>
    </div>
  );
}

// ==================== HOTSPOT (simplified as tap-to-select) ====================
function HotspotQuiz({ quiz, onAnswer }: InteractiveQuizProps) {
  // Simplified: show options as a grid, one is correct
  return <MCQQuiz quiz={quiz} onAnswer={onAnswer} />;
}

// ==================== AUDIO (placeholder) ====================
function AudioQuiz({ quiz, onAnswer }: InteractiveQuizProps) {
  return (
    <div className="space-y-4 text-center py-6">
      <span className="text-4xl">🎧</span>
      <h4 className="text-sm font-black text-foreground">Audio Quiz</h4>
      <p className="text-[12px] text-muted-foreground">Coming soon! For now, here's a text version:</p>
      <FillInQuiz quiz={quiz} onAnswer={onAnswer} />
    </div>
  );
}

// ==================== MAIN COMPONENT ====================
export default function InteractiveQuiz({ quiz, onAnswer }: InteractiveQuizProps) {
  const quizRenderers: Record<QuizVariant, React.FC<InteractiveQuizProps>> = {
    mcq: MCQQuiz,
    truefalse: TrueFalseQuiz,
    fillin: FillInQuiz,
    slider: SliderQuiz,
    match: MatchQuiz,
    dragdrop: DragDropQuiz,
    codefill: CodeFillQuiz,
    hotspot: HotspotQuiz,
    wordbank: WordBankQuiz,
    rating: RatingQuiz,
    categorize: CategorizeQuiz,
    flashcard: FlashcardQuiz,
    audio: AudioQuiz,
    emoji: EmojiQuiz,
    speedround: SpeedRoundQuiz,
  };

  const Renderer = quizRenderers[quiz.type] || MCQQuiz;

  const typeLabels: Record<string, string> = {
    mcq: "Multiple Choice", truefalse: "True or False", fillin: "Fill in the Blank",
    slider: "Slider", match: "Match Columns", dragdrop: "Arrange Order",
    codefill: "Complete the Code", hotspot: "Select Area", wordbank: "Word Bank",
    rating: "Rate Statements", categorize: "Categorize", flashcard: "Flashcard",
    audio: "Audio", emoji: "React", speedround: "Speed Round",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="rounded-3xl bg-card border border-agni-gold/20 overflow-hidden"
    >
      <div className="px-5 pt-5 pb-3 flex items-center gap-2 flex-wrap">
        <span className="text-[9px] font-black px-2.5 py-1 rounded-full text-agni-gold bg-agni-gold/15">
          🧩 QUIZ
        </span>
        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">
          {typeLabels[quiz.type] || quiz.type}
        </span>
        <DifficultyBadge difficulty={quiz.difficulty} />
      </div>
      <div className="px-5 pb-3">
        <h3 className="text-[15px] font-black text-foreground leading-snug">{quiz.question}</h3>
        {quiz.hint && (
          <p className="text-[11px] text-muted-foreground mt-1.5">💡 Hint: {quiz.hint}</p>
        )}
      </div>
      <div className="px-5 pb-5">
        <Renderer quiz={quiz} onAnswer={onAnswer} />
      </div>
    </motion.div>
  );
}
