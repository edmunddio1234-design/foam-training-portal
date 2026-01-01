
import React, { useState } from 'react';
import { QuizQuestion } from '../types';

interface QuizProps {
  questions: QuizQuestion[];
  onComplete: () => void;
  onPass?: () => void;
}

const Quiz: React.FC<QuizProps> = ({ questions, onComplete, onPass }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const currentQuestion = questions[currentIndex];
  const isPassed = score === questions.length;

  const handleSelect = (index: number) => {
    if (showResult) return;
    setSelectedOption(index);
  };

  const handleNext = () => {
    if (selectedOption === null) return;
    
    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    let newScore = score;
    if (isCorrect) {
      newScore = score + 1;
      setScore(newScore);
    }
    
    setShowResult(true);
    
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedOption(null);
        setShowResult(false);
      } else {
        setQuizFinished(true);
        // If they passed all, notify parent
        if (newScore === questions.length && onPass) {
          onPass();
        }
      }
    }, 1000);
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setShowResult(false);
    setScore(0);
    setQuizFinished(false);
  };

  if (quizFinished) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-in zoom-in-95 duration-500">
        {isPassed ? (
          <>
            <div className="w-24 h-24 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 shadow-xl shadow-emerald-100 animate-bounce">
               <i className="fas fa-certificate text-4xl"></i>
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">Certification Earned!</h3>
              <p className="text-slate-500 font-medium text-lg">You correctly answered all {questions.length} knowledge checks.</p>
            </div>
            <button 
              onClick={onComplete}
              className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-emerald-200 hover:bg-emerald-700 hover:-translate-y-1 transition-all flex items-center gap-3"
            >
              Proceed to Next Module <i className="fas fa-chevron-right"></i>
            </button>
          </>
        ) : (
          <>
            <div className="w-24 h-24 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
               <i className="fas fa-redo-alt text-4xl"></i>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Review Required</h3>
              <p className="text-slate-500 font-medium">You scored {score} / {questions.length}. To proceed, you must answer all questions correctly.</p>
            </div>
            <div className="flex flex-col gap-3 w-full max-w-xs">
              <button 
                onClick={resetQuiz}
                className="w-full py-4 bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all"
              >
                Retry Assessment
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full space-y-8">
      <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
          <span>Question {currentIndex + 1} of {questions.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <i className="fas fa-bullseye text-indigo-400"></i>
          <span>Accuracy: {Math.round((score / questions.length) * 100)}%</span>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">
          {currentQuestion.question}
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {currentQuestion.options.map((option, i) => {
            let statusClass = 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30';
            if (showResult) {
              if (i === currentQuestion.correctAnswer) statusClass = 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-4 ring-emerald-50';
              else if (i === selectedOption) statusClass = 'bg-rose-50 border-rose-500 text-rose-700 ring-4 ring-rose-50';
              else statusClass = 'bg-white opacity-40 border-slate-100';
            } else if (selectedOption === i) {
              statusClass = 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-4 ring-indigo-50';
            }

            return (
              <button
                key={i}
                disabled={showResult}
                onClick={() => handleSelect(i)}
                className={`w-full text-left p-5 rounded-2xl border-2 font-bold transition-all flex items-center justify-between group ${statusClass}`}
              >
                <div className="flex items-center gap-4">
                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black border transition-colors ${selectedOption === i ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-400 border-slate-100 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>
                     {String.fromCharCode(65 + i)}
                   </div>
                   <span>{option}</span>
                </div>
                {showResult && i === currentQuestion.correctAnswer && <i className="fas fa-check-circle text-emerald-500"></i>}
                {showResult && i === selectedOption && i !== currentQuestion.correctAnswer && <i className="fas fa-times-circle text-rose-500"></i>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-6 border-t border-slate-100 flex justify-end">
        <button
          disabled={selectedOption === null || showResult}
          onClick={handleNext}
          className={`px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 ${
            selectedOption === null || showResult
              ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
              : 'bg-[#0F2C5C] text-white hover:bg-[#1A4D2E] shadow-lg shadow-indigo-100'
          }`}
        >
          {showResult ? 'Processing...' : 'Confirm Answer'}
          {!showResult && <i className="fas fa-check-double"></i>}
        </button>
      </div>
    </div>
  );
};

export default Quiz;
