import React, { useState, useEffect } from 'react';
import { HelpCircle, Check, X, Sparkles, Award } from 'lucide-react';
import { Language } from '../types';
import { sound } from '../utils/audio';

interface MathQuizProps {
  lang: Language;
  onCorrectAnswer: (coinsWon: number) => void;
}

interface Question {
  questionText: string;
  options: number[];
  correctAnswer: number;
}

function generateQuestion(): Question {
  const ops = ['+', '-', '*'];
  const op = ops[Math.floor(Math.random() * ops.length)];

  let a = 0;
  let b = 0;
  let ans = 0;

  if (op === '+') {
    a = Math.floor(Math.random() * 40) + 10;
    b = Math.floor(Math.random() * 40) + 5;
    ans = a + b;
  } else if (op === '-') {
    a = Math.floor(Math.random() * 50) + 25;
    b = Math.floor(Math.random() * 20) + 5;
    ans = a - b;
  } else {
    // Multiplication
    a = Math.floor(Math.random() * 12) + 2;
    b = Math.floor(Math.random() * 10) + 2;
    ans = a * b;
  }

  // Generate 4 unique options
  const wrong1 = ans + (Math.floor(Math.random() * 5) + 1) * (Math.random() > 0.5 ? 1 : -1);
  const wrong2 = ans + (Math.floor(Math.random() * 8) + 6) * (Math.random() > 0.5 ? 1 : -1);
  const wrong3 = ans + 10;

  const set = new Set<number>([ans, wrong1, wrong2, wrong3]);
  while (set.size < 4) {
    set.add(ans + Math.floor(Math.random() * 20) - 10);
  }

  const options = Array.from(set).sort(() => Math.random() - 0.5);

  return {
    questionText: `${a} ${op === '*' ? '×' : op} ${b} = ?`,
    options,
    correctAnswer: ans,
  };
}

export const MathQuiz: React.FC<MathQuizProps> = ({ lang, onCorrectAnswer }) => {
  const [currentQ, setCurrentQ] = useState<Question>(generateQuestion);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelect = (opt: number) => {
    if (isAnswered) return;
    setSelectedOpt(opt);
    setIsAnswered(true);

    if (opt === currentQ.correctAnswer) {
      sound.playWin();
      setScore((s) => s + 1);
      onCorrectAnswer(5);
    } else {
      sound.playTick();
    }

    setTimeout(() => {
      setCurrentQ(generateQuestion());
      setSelectedOpt(null);
      setIsAnswered(false);
    }, 1200);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 border-b border-slate-800/80 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-amber-400" />
            {lang === 'hi' ? 'गणित क्विज़ - सही जवाब पर सिक्के' : 'Math Quiz - Solve & Earn'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            {lang === 'hi'
              ? 'आसान सवाल का सही जवाब दें और हर सही जवाब पर 5 सिक्के पाएं!'
              : 'Answer simple questions correctly to earn +5 coins every time!'}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 px-4 py-2 rounded-2xl">
          <Award className="w-5 h-5 text-amber-400" />
          <div className="text-left">
            <div className="text-xs text-slate-400 font-medium">
              {lang === 'hi' ? 'सही जवाब' : 'Correct Solved'}
            </div>
            <div className="text-base font-black text-white">
              {score}
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Card */}
      <div className="max-w-md mx-auto my-3 flex flex-col items-center">
        <div className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl p-6 text-center shadow-inner mb-5">
          <span className="text-xs uppercase font-bold tracking-widest text-amber-400">
            {lang === 'hi' ? 'सवाल' : 'QUESTION'}
          </span>
          <div className="text-3xl sm:text-4xl font-black text-white my-3 tracking-wider">
            {currentQ.questionText}
          </div>
          <span className="text-xs text-slate-400">
            {lang === 'hi' ? 'सही विकल्प पर टैप करें' : 'Tap the correct answer'}
          </span>
        </div>

        {/* 4 Options Grid */}
        <div className="grid grid-cols-2 gap-3 w-full">
          {currentQ.options.map((opt, i) => {
            const isCorrect = opt === currentQ.correctAnswer;
            const isChosen = opt === selectedOpt;

            let btnStyle = 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-white hover:border-amber-400/50';

            if (isAnswered) {
              if (isCorrect) {
                btnStyle = 'bg-emerald-600/30 border-emerald-400 text-emerald-300 ring-2 ring-emerald-500/50';
              } else if (isChosen) {
                btnStyle = 'bg-rose-600/30 border-rose-500 text-rose-300';
              } else {
                btnStyle = 'bg-slate-800/40 border-slate-800 text-slate-600 opacity-40';
              }
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(opt)}
                disabled={isAnswered}
                className={`py-4 px-5 rounded-2xl font-black text-xl border transition-all flex items-center justify-center gap-2 ${btnStyle}`}
              >
                <span>{opt}</span>
                {isAnswered && isCorrect && <Check className="w-5 h-5 text-emerald-400" />}
                {isAnswered && isChosen && !isCorrect && <X className="w-5 h-5 text-rose-400" />}
              </button>
            );
          })}
        </div>

        {isAnswered && selectedOpt === currentQ.correctAnswer && (
          <div className="mt-4 text-emerald-400 font-extrabold text-sm flex items-center gap-1.5 animate-bounce">
            <Sparkles className="w-4 h-4" />
            <span>{lang === 'hi' ? '+15 सिक्के वॉलेट में जुड़ गए!' : '+15 Coins Added to Wallet!'}</span>
          </div>
        )}
      </div>
    </div>
  );
};
