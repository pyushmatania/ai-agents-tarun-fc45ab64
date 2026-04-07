import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ArrowRight, Sparkles, RefreshCw, Trophy, Brain } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getAIConfig } from "@/lib/aiConfig";
import { buildQuizPrompt, buildRemediationPrompt, buildPersonalizedPrompt, getPersona } from "@/lib/neuralOS";
import BotIllustration from "./illustrations/BotIllustration";

interface QuizQuestion {
  type: string;
  q: string;
  opts: string[];
  ans: number;
  why?: string;
  remediate?: string;
}

interface PracticalQuizModalProps {
  open: boolean;
  onClose: () => void;
  lessonTopic: string;
  lessonInfo: string;
  lessonTitle: string;
  onComplete?: (score: number, total: number) => void;
}

const PracticalQuizModal = ({ open, onClose, lessonTopic, lessonInfo, lessonTitle, onComplete }: PracticalQuizModalProps) => {
  const [phase, setPhase] = useState<"loading" | "quiz" | "remediation" | "results" | "error">("loading");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [score, setScore] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [remediation, setRemediation] = useState("");
  const [remLoading, setRemLoading] = useState(false);

  useEffect(() => {
    if (open) loadQuiz();
    else {
      // reset on close
      setPhase("loading");
      setQuestions([]);
      setCurrentIdx(0);
      setPicked(null);
      setLocked(false);
      setScore(0);
      setRemediation("");
    }
  }, [open]);

  const callAI = async (userPrompt: string, systemPrompt?: string): Promise<string> => {
    const config = getAIConfig();
    const body: any = {
      system: systemPrompt || buildPersonalizedPrompt("You are AGNI, an elite AI Agents tutor."),
      messages: [{ role: "user", content: userPrompt }],
    };
    if (config.mode === "byok" && config.byokApiKey) {
      body.customApiKey = config.byokApiKey;
      body.provider = config.byokProvider;
      body.model = config.byokModel;
    } else {
      body.model = config.builtinModel;
    }
    const { data, error } = await supabase.functions.invoke("ai-tutor", { body });
    if (error) throw new Error(error.message);
    return data?.text || data?.content || JSON.stringify(data);
  };

  const loadQuiz = async () => {
    setPhase("loading");
    setErrorMsg("");
    try {
      const prompt = buildQuizPrompt({ lessonTopic, lessonInfo, numQuestions: 8 });
      const raw = await callAI(prompt, "You are a quiz generator. Output ONLY valid JSON arrays. No prose, no markdown.");
      const cleaned = raw.replace(/```json|```/g, "").trim();
      const match = cleaned.match(/\[[\s\S]*\]/);
      if (!match) throw new Error("Could not parse quiz response");
      const parsed = JSON.parse(match[0]);
      if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("No questions returned");
      setQuestions(parsed);
      setPhase("quiz");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load quiz");
      setPhase("error");
    }
  };

  const pickAnswer = (idx: number) => {
    if (locked) return;
    const q = questions[currentIdx];
    const isCorrect = idx === q.ans;
    setPicked(idx);
    setLocked(true);
    if (isCorrect) {
      setScore(score + 1);
    } else {
      // Trigger remediation
      loadRemediation(q.remediate || q.q);
    }
  };

  const loadRemediation = async (concept: string) => {
    setRemLoading(true);
    try {
      const prompt = buildRemediationPrompt(lessonTopic, concept);
      const text = await callAI(prompt);
      setRemediation(text);
    } catch {
      setRemediation("No worries! Let's break this down differently. Take a moment, re-read the question, and try the next one. You've got this! 💪");
    }
    setRemLoading(false);
  };

  const nextQuestion = () => {
    setPicked(null);
    setLocked(false);
    setRemediation("");
    if (currentIdx + 1 >= questions.length) {
      setPhase("results");
      onComplete?.(score, questions.length);
    } else {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const showRemediation = () => {
    setPhase("remediation");
  };

  const continueFromRemediation = () => {
    setPhase("quiz");
    nextQuestion();
  };

  if (!open) return null;

  const q = questions[currentIdx];
  const persona = getPersona();
  const progressPct = questions.length > 0 ? ((currentIdx + (locked ? 1 : 0)) / questions.length) * 100 : 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      >
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="bg-card border-t sm:border border-border w-full max-w-md sm:rounded-3xl rounded-t-3xl max-h-[95vh] flex flex-col overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="px-5 pt-4 pb-3 border-b border-border flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 shrink-0">
              <BotIllustration size={40} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Practical Quiz</p>
              <h2 className="text-sm font-bold text-foreground truncate">{lessonTitle}</h2>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-muted flex items-center justify-center"
            >
              <X size={16} />
            </button>
          </div>

          {/* Progress bar */}
          {phase === "quiz" && questions.length > 0 && (
            <div className="px-5 pt-3 shrink-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-muted-foreground">
                  Q{currentIdx + 1} of {questions.length}
                </span>
                <span className="text-[10px] font-bold text-primary">Score: {score}</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5">
            {phase === "loading" && (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Brain size={48} className="text-primary" />
                </motion.div>
                <p className="text-sm font-bold text-foreground">AGNI is crafting your quiz...</p>
                <p className="text-xs text-muted-foreground text-center max-w-xs">
                  Building 8 practical questions personalized to your interests{persona.currentCompany ? ` and your work at ${persona.currentCompany}` : ""}.
                </p>
              </div>
            )}

            {phase === "error" && (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <p className="text-4xl">😅</p>
                <p className="text-sm font-bold text-foreground text-center">Couldn't load the quiz</p>
                <p className="text-xs text-muted-foreground text-center max-w-xs">{errorMsg}</p>
                <button
                  onClick={loadQuiz}
                  className="mt-2 bg-primary text-primary-foreground rounded-xl px-4 py-2 text-sm font-bold flex items-center gap-2"
                >
                  <RefreshCw size={14} /> Try again
                </button>
              </div>
            )}

            {phase === "quiz" && q && (
              <motion.div
                key={currentIdx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {/* Question type badge */}
                <div className="inline-block px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-wider mb-3">
                  {q.type === "future-use" ? "🔮 Future use" :
                   q.type === "scenario" ? "🎬 Scenario" :
                   q.type === "application" ? "💼 Apply it" :
                   q.type === "debug" ? "🔧 Debug" :
                   q.type === "design" ? "🎨 Design" : "🎯 Practical"}
                </div>

                <h3 className="text-base font-bold text-foreground mb-5 leading-snug">{q.q}</h3>

                <div className="space-y-2">
                  {q.opts.map((opt, i) => {
                    const isPicked = picked === i;
                    const isCorrect = i === q.ans;
                    const showCorrect = locked && isCorrect;
                    const showWrong = locked && isPicked && !isCorrect;
                    return (
                      <motion.button
                        key={i}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => pickAnswer(i)}
                        disabled={locked}
                        className={`w-full text-left p-3 rounded-2xl border-2 transition-all flex items-start gap-3 ${
                          showCorrect
                            ? "bg-green-500/10 border-green-500"
                            : showWrong
                            ? "bg-red-500/10 border-red-500"
                            : isPicked
                            ? "bg-primary/10 border-primary"
                            : "bg-muted/30 border-border hover:border-muted-foreground/40"
                        }`}
                      >
                        <div className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-[11px] font-bold ${
                          showCorrect ? "bg-green-500 text-white" :
                          showWrong ? "bg-red-500 text-white" :
                          "bg-card border border-border text-muted-foreground"
                        }`}>
                          {showCorrect ? <Check size={12} strokeWidth={3} /> :
                           showWrong ? <X size={12} strokeWidth={3} /> :
                           ["A", "B", "C", "D"][i]}
                        </div>
                        <span className="text-sm text-foreground leading-snug">{opt}</span>
                      </motion.button>
                    );
                  })}
                </div>

                {locked && q.why && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 rounded-xl bg-muted/50 border border-border"
                  >
                    <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Why</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{q.why}</p>
                  </motion.div>
                )}

                {locked && (
                  <div className="mt-5">
                    {picked !== q.ans ? (
                      <button
                        onClick={showRemediation}
                        disabled={remLoading}
                        className="w-full bg-orange-500 text-white font-bold rounded-2xl py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {remLoading ? (
                          <>Loading explanation...</>
                        ) : (
                          <><Sparkles size={14} /> Let's go back to basics</>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={nextQuestion}
                        className="w-full bg-primary text-primary-foreground font-bold rounded-2xl py-3 text-sm flex items-center justify-center gap-2"
                      >
                        {currentIdx + 1 >= questions.length ? "See results" : "Next question"} <ArrowRight size={15} />
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {phase === "remediation" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-2"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 shrink-0">
                    <BotIllustration size={48} />
                  </div>
                  <div className="flex-1 bg-orange-500/10 border border-orange-500/30 rounded-2xl rounded-bl-sm p-4">
                    <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-1.5">Back to basics</p>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{remediation}</p>
                  </div>
                </div>
                <button
                  onClick={continueFromRemediation}
                  className="w-full bg-primary text-primary-foreground font-bold rounded-2xl py-3 text-sm flex items-center justify-center gap-2 mt-4"
                >
                  Got it, next question <ArrowRight size={15} />
                </button>
              </motion.div>
            )}

            {phase === "results" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center"
              >
                <div className="text-6xl mb-3">
                  {score === questions.length ? "🏆" : score >= questions.length * 0.7 ? "🎉" : score >= questions.length * 0.4 ? "💪" : "📚"}
                </div>
                <h3 className="text-2xl font-extrabold text-foreground mb-1">
                  {score === questions.length ? "Perfect!" :
                   score >= questions.length * 0.7 ? "Great job!" :
                   score >= questions.length * 0.4 ? "Solid effort!" : "Keep practicing!"}
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  You got <span className="font-bold text-primary">{score}/{questions.length}</span> right
                </p>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-primary/10 border border-primary/30 rounded-2xl p-4">
                    <Trophy size={20} className="text-primary mx-auto mb-1" />
                    <div className="text-2xl font-extrabold text-primary">+{Math.round(50 * (score / questions.length))}</div>
                    <div className="text-[10px] text-muted-foreground font-bold">XP</div>
                  </div>
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-4">
                    <Brain size={20} className="text-purple-500 mx-auto mb-1" />
                    <div className="text-2xl font-extrabold text-purple-500">{Math.round((score / questions.length) * 100)}%</div>
                    <div className="text-[10px] text-muted-foreground font-bold">Accuracy</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={loadQuiz}
                    className="w-full bg-muted text-foreground font-bold rounded-2xl py-3 text-sm flex items-center justify-center gap-2 border border-border"
                  >
                    <RefreshCw size={14} /> New quiz
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full bg-primary text-primary-foreground font-bold rounded-2xl py-3 text-sm"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PracticalQuizModal;
