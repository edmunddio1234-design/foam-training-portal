import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, XCircle, Send, User, Phone, MessageSquare, 
  BookOpen, RefreshCw, ArrowLeft, Award, ChevronDown
} from 'lucide-react';

// Module/Class data with tailored questions
const CLASS_ASSESSMENTS = [
  {
    id: 1,
    title: "Conflict Resolution/Anger Management",
    questions: [
      "Do you feel more confident managing your emotions and resolving conflicts after this lesson?",
      "Has this lesson encouraged you to reflect on how you handle anger around your children?",
      "Do you believe the strategies discussed will help you respond calmly in difficult situations?"
    ]
  },
  {
    id: 2,
    title: "Becoming Self-Sufficient",
    questions: [
      "Do you feel more confident in your ability to provide for yourself and your family after this lesson?",
      "Has this lesson encouraged you to reflect on steps you can take toward greater independence?",
      "Do you believe the skills discussed will help you become more self-reliant as a father?"
    ]
  },
  {
    id: 3,
    title: "Building Your Child's Self-Esteem",
    questions: [
      "Do you feel more confident in your ability to build your child's self-esteem after this lesson?",
      "Has this lesson encouraged you to reflect on how your words and actions affect your child's confidence?",
      "Do you believe the techniques discussed will help you nurture your child's self-worth?"
    ]
  },
  {
    id: 4,
    title: "Co-Parenting/Single Fatherhood",
    questions: [
      "Do you feel more confident navigating co-parenting or single fatherhood after this lesson?",
      "Has this lesson encouraged you to reflect on how to maintain a healthy relationship with your child's other parent?",
      "Do you believe the strategies discussed will improve your co-parenting communication?"
    ]
  },
  {
    id: 5,
    title: "Male/Female Relationship",
    questions: [
      "Do you feel more confident in building healthy relationships after this lesson?",
      "Has this lesson encouraged you to reflect on how your relationship affects your children?",
      "Do you believe the insights discussed will help you maintain healthier partnerships?"
    ]
  },
  {
    id: 6,
    title: "Manhood",
    questions: [
      "Do you feel more confident in your understanding of what it means to be a man after this lesson?",
      "Has this lesson encouraged you to reflect on the example you set for your children?",
      "Do you believe the values discussed will guide you in being a better role model?"
    ]
  },
  {
    id: 7,
    title: "Values",
    questions: [
      "Do you feel more confident expressing your feelings to help your relationships after this lesson?",
      "Has this lesson encouraged you to reflect on how your actions align with the values you want to teach your children?",
      "Do you believe the values discussed in this lesson will influence how you interact with your children or others in your life?"
    ]
  },
  {
    id: 8,
    title: "Communication/Active Listening",
    questions: [
      "Do you feel more confident in your communication skills after this lesson?",
      "Has this lesson encouraged you to reflect on how well you listen to your children?",
      "Do you believe the communication techniques will help strengthen your family relationships?"
    ]
  },
  {
    id: 9,
    title: "Dealing with Stress",
    questions: [
      "Do you feel more confident in managing stress after this lesson?",
      "Has this lesson encouraged you to reflect on how stress affects your role as a father?",
      "Do you believe the coping strategies discussed will help you handle pressure more effectively?"
    ]
  },
  {
    id: 10,
    title: "Coping with Fatherhood Discrimination",
    questions: [
      "Do you feel more equipped to handle discrimination as a father after this lesson?",
      "Has this lesson encouraged you to reflect on challenges you've faced in being recognized as an equal parent?",
      "Do you believe the strategies discussed will help you advocate for your rights as a father?"
    ]
  },
  {
    id: 11,
    title: "Fatherhood Today",
    questions: [
      "Do you feel more confident about your role in modern fatherhood after this lesson?",
      "Has this lesson encouraged you to reflect on the unique challenges fathers face today?",
      "Do you believe the insights discussed will help you adapt to changing expectations of fathers?"
    ]
  },
  {
    id: 12,
    title: "Understanding Children's Needs",
    questions: [
      "Do you feel more confident in understanding what your children need from you after this lesson?",
      "Has this lesson encouraged you to reflect on how you meet your children's emotional needs?",
      "Do you believe the knowledge gained will help you better support your children's development?"
    ]
  },
  {
    id: 13,
    title: "A Father's Influence on His Child",
    questions: [
      "Do you feel more aware of the impact you have on your child's life after this lesson?",
      "Has this lesson encouraged you to reflect on the legacy you want to leave for your children?",
      "Do you believe the insights discussed will motivate you to be more intentional in your fathering?"
    ]
  },
  {
    id: 14,
    title: "Relationships",
    questions: [
      "Do you feel more confident expressing your feelings to help your relationships after this lesson?",
      "Has this lesson encouraged you to reflect on how your actions align with the values you want to teach your children?",
      "Do you believe the values discussed in this lesson will influence how you interact with your children or others in your life?"
    ]
  }
];

// API URL
const API_BASE_URL = 'https://foamla-backend-2.onrender.com';

interface AssessmentResponse {
  lessonId: number;
  lessonTitle: string;
  question1: boolean | null;
  question2: boolean | null;
  question3: boolean | null;
  challenges: string;
  fatherName: string;
  phone: string;
  submittedAt: string;
}

const ClassAssessment: React.FC = () => {
  // Get module from URL params if provided
  const urlParams = new URLSearchParams(window.location.search);
  const moduleIdFromUrl = parseInt(urlParams.get('module') || '0');

  const [step, setStep] = useState<'select' | 'questions' | 'challenges' | 'contact' | 'success'>('select');
  const [selectedLesson, setSelectedLesson] = useState<typeof CLASS_ASSESSMENTS[0] | null>(
    moduleIdFromUrl ? CLASS_ASSESSMENTS.find(c => c.id === moduleIdFromUrl) || null : null
  );
  const [answers, setAnswers] = useState<(boolean | null)[]>([null, null, null]);
  const [challenges, setChallenges] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If module was in URL, skip to questions
  useEffect(() => {
    if (moduleIdFromUrl && selectedLesson) {
      setStep('questions');
    }
  }, []);

  const handleLessonSelect = (lesson: typeof CLASS_ASSESSMENTS[0]) => {
    setSelectedLesson(lesson);
    setStep('questions');
  };

  const handleAnswer = (questionIndex: number, answer: boolean) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answer;
    setAnswers(newAnswers);
  };

  const canProceedFromQuestions = answers.every(a => a !== null);

  const handleSubmit = async () => {
    if (!selectedLesson || !fatherName.trim()) return;

    setSubmitting(true);
    setError(null);

    const response: AssessmentResponse = {
      lessonId: selectedLesson.id,
      lessonTitle: selectedLesson.title,
      question1: answers[0],
      question2: answers[1],
      question3: answers[2],
      challenges: challenges.trim(),
      fatherName: fatherName.trim(),
      phone: phone.trim(),
      submittedAt: new Date().toISOString()
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/fatherhood/assessment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(response)
      });

      const data = await res.json();

      if (data.success) {
        setStep('success');
      } else {
        setError(data.message || 'Failed to submit assessment. Please try again.');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('Connection error. Please check your internet and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep('select');
    setSelectedLesson(null);
    setAnswers([null, null, null]);
    setChallenges('');
    setFatherName('');
    setPhone('');
    setError(null);
  };

  // STEP 1: Select Lesson
  if (step === 'select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800">
        {/* Header */}
        <div className="p-6 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen size={32} />
          </div>
          <h1 className="text-2xl font-bold mb-2">Class Assessment</h1>
          <p className="text-blue-100">Select the class you attended today</p>
        </div>

        {/* Lesson List */}
        <div className="bg-white rounded-t-3xl min-h-[70vh] p-6">
          <div className="space-y-2">
            {CLASS_ASSESSMENTS.map(lesson => (
              <button
                key={lesson.id}
                onClick={() => handleLessonSelect(lesson)}
                className="w-full text-left p-4 bg-slate-50 hover:bg-blue-50 border-2 border-slate-200 hover:border-blue-300 rounded-xl transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 font-bold">
                      {lesson.id}
                    </div>
                    <span className="font-medium text-slate-800">{lesson.title}</span>
                  </div>
                  <ChevronDown className="text-slate-400 -rotate-90" size={20} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // STEP 2: Answer Questions
  if (step === 'questions' && selectedLesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800">
        {/* Header */}
        <div className="p-6 text-white">
          <button 
            onClick={() => setStep('select')}
            className="flex items-center gap-2 text-white/70 hover:text-white mb-4"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="bg-white/10 rounded-xl px-4 py-2 inline-block mb-4">
            <p className="text-sm text-blue-100">Module {selectedLesson.id}</p>
            <p className="font-semibold">{selectedLesson.title}</p>
          </div>
          <h2 className="text-xl font-bold">Please answer these questions</h2>
        </div>

        {/* Questions */}
        <div className="bg-white rounded-t-3xl min-h-[70vh] p-6">
          <div className="space-y-6">
            {selectedLesson.questions.map((question, index) => (
              <div key={index} className="bg-slate-50 rounded-xl p-4">
                <p className="text-slate-800 font-medium mb-4">
                  {index + 1}. {question}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleAnswer(index, true)}
                    className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                      answers[index] === true
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-emerald-300'
                    }`}
                  >
                    <CheckCircle2 size={20} />
                    Yes
                  </button>
                  <button
                    onClick={() => handleAnswer(index, false)}
                    className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                      answers[index] === false
                        ? 'bg-red-500 text-white'
                        : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-red-300'
                    }`}
                  >
                    <XCircle size={20} />
                    No
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Continue Button */}
          <button
            onClick={() => setStep('challenges')}
            disabled={!canProceedFromQuestions}
            className={`w-full mt-6 py-4 rounded-xl font-bold transition-all ${
              canProceedFromQuestions
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // STEP 3: Challenges
  if (step === 'challenges') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800">
        {/* Header */}
        <div className="p-6 text-white">
          <button 
            onClick={() => setStep('questions')}
            className="flex items-center gap-2 text-white/70 hover:text-white mb-4"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4">
            <MessageSquare size={28} />
          </div>
          <h2 className="text-xl font-bold">Share Your Challenges</h2>
          <p className="text-blue-100 mt-1">We're here to help you overcome obstacles</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-t-3xl min-h-[70vh] p-6">
          <p className="text-slate-700 mb-4">
            Are there any challenges you may be experiencing that make being a father or co-parent difficult? 
            <span className="text-slate-500"> (i.e. relationships, transportation, or financial challenges etc.)</span>
          </p>
          
          <textarea
            value={challenges}
            onChange={(e) => setChallenges(e.target.value)}
            placeholder="Share any challenges you're facing... (optional)"
            className="w-full h-48 p-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
          />

          <p className="text-sm text-slate-500 mt-2">
            If you share challenges, a FOAM staff member may reach out to help.
          </p>

          {/* Continue Button */}
          <button
            onClick={() => setStep('contact')}
            className="w-full mt-6 py-4 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all"
          >
            Continue
          </button>

          <button
            onClick={() => {
              setChallenges('');
              setStep('contact');
            }}
            className="w-full mt-3 py-3 rounded-xl font-medium text-slate-500 hover:text-slate-700 transition-all"
          >
            Skip this step
          </button>
        </div>
      </div>
    );
  }

  // STEP 4: Contact Info
  if (step === 'contact') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800">
        {/* Header */}
        <div className="p-6 text-white">
          <button 
            onClick={() => setStep('challenges')}
            className="flex items-center gap-2 text-white/70 hover:text-white mb-4"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4">
            <User size={28} />
          </div>
          <h2 className="text-xl font-bold">Your Information</h2>
          <p className="text-blue-100 mt-1">So we can follow up if needed</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-t-3xl min-h-[70vh] p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Your Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(225) 555-1234"
                  className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>
              <p className="text-sm text-slate-500 mt-1">
                We'll call to assist you in overcoming any challenges
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={submitting || !fatherName.trim()}
            className={`w-full mt-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              submitting || !fatherName.trim()
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white'
            }`}
          >
            {submitting ? (
              <>
                <RefreshCw className="animate-spin" size={20} />
                Submitting...
              </>
            ) : (
              <>
                <Send size={20} />
                Submit Assessment
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // STEP 5: Success
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-500 to-emerald-700 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6">
          <Award className="text-emerald-500" size={56} />
        </div>
        
        <h1 className="text-3xl font-bold mb-2">Thank You!</h1>
        <p className="text-emerald-100 mb-2">Your assessment has been submitted.</p>
        
        {selectedLesson && (
          <div className="bg-white/20 rounded-xl px-6 py-3 mb-8">
            <p className="text-sm text-emerald-100">Completed</p>
            <p className="font-semibold">{selectedLesson.title}</p>
          </div>
        )}

        <p className="text-emerald-100 mb-8 max-w-sm">
          We appreciate your feedback. If you shared any challenges, a FOAM staff member may reach out to assist you.
        </p>

        <button
          onClick={resetForm}
          className="bg-white text-emerald-600 font-bold py-4 px-8 rounded-xl"
        >
          Done
        </button>
      </div>
    );
  }

  // Fallback
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <RefreshCw className="animate-spin text-blue-600" size={48} />
    </div>
  );
};

export default ClassAssessment;
