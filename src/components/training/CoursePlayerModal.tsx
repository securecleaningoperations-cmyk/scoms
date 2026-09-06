"use client";

import React, { useState } from "react";
import {
  Play, CheckCircle2, Award, X, RotateCcw,
  BookOpen, Clock, AlertCircle, ArrowRight, Printer, Share2, Sparkles
} from "lucide-react";

export interface CourseQuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface CourseData {
  id: string;
  title: string;
  series: string;
  durationMinutes: number;
  videoUrl?: string;
  videoPlaceholder?: string;
  description: string;
  keyPoints: string[];
  quiz: CourseQuizQuestion[];
}

export const SAMPLE_COURSES: Record<string, CourseData> = {
  default: {
    id: "course-1",
    title: "Personal Protective Equipment & Chemical Dilution Protocols",
    series: "Series 2 — Safety & Compliance",
    durationMinutes: 20,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    description: "Master OSHA-mandated PPE guidelines, safety data sheet (SDS) compliance, and precise chemical dilution for high-traffic facilities.",
    keyPoints: [
      "Always inspect nitrile gloves and eye protection before handling quaternary ammonium concentrates.",
      "Never mix bleach (sodium hypochlorite) with ammonia or acidic descalers due to toxic gas hazards.",
      "Follow exact dwell-times: standard disinfectants require 3 to 10 minutes of wet contact time for 99.99% pathogen kill rates.",
      "Ensure proper ventilation when applying aerosolized disinfectants in enclosed commercial restrooms."
    ],
    quiz: [
      {
        question: "What is the mandatory minimum wet dwell time for standard EPA-registered hospital disinfectants?",
        options: ["30 seconds", "1 minute", "3 to 10 minutes depending on manufacturer label", "No dwell time required if wiped immediately"],
        correctIndex: 2,
        explanation: "EPA-registered hospital disinfectants require 3 to 10 minutes of wet contact time to achieve laboratory-tested kill rates against enveloped viruses and bacteria."
      },
      {
        question: "Why must sodium hypochlorite (bleach) NEVER be combined with ammonia-based cleaners?",
        options: ["It reduces the cleaning power slightly", "It produces lethal toxic chloramine gas", "It discolors porcelain tiles", "It creates excessive foam"],
        correctIndex: 1,
        explanation: "Mixing bleach and ammonia produces chloramine gas, which is severely toxic and potentially fatal if inhaled in enclosed areas."
      },
      {
        question: "When should safety glasses or face shields be worn by cleaning staff?",
        options: ["Only during outdoor sidewalk pressure washing", "Whenever measuring or pouring concentrated cleaning chemicals", "Only when requested by the facility client", "Never required for commercial janitorial work"],
        correctIndex: 1,
        explanation: "OSHA standard 1910.133 mandates eye protection whenever handling, diluting, or pouring liquid chemical concentrates."
      },
      {
        question: "What is the first action to take if a chemical splash enters an employee's eye?",
        options: ["Wait 10 minutes to see if irritation persists", "Apply rubbing alcohol immediately", "Flush eye with clean water at an eyewash station for at least 15 minutes", "Close the eye tightly and resume shift"],
        correctIndex: 2,
        explanation: "Immediate, continuous flushing with clean water for a minimum of 15 minutes is the critical emergency protocol for chemical eye splashes."
      },
      {
        question: "Where must Safety Data Sheets (SDS) be accessible during cleaning operations?",
        options: ["Locked in the CEO's home office", "Readily accessible in digital SCOMS or physical janitorial supply closets", "Only available at local hospital emergency rooms", "Sent by mail after 30 days"],
        correctIndex: 1,
        explanation: "OSHA HazCom standard requires Safety Data Sheets to be immediately accessible to employees in their active work area during all shifts."
      }
    ]
  },
  "Series 3 — Security": {
    id: "course-2",
    title: "Keys, Badges & Restricted Access in CMMC Facilities",
    series: "Series 3 — Security & Defense Readiness",
    durationMinutes: 25,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    description: "Protocols for managing physical access, key cards, classified trash disposal, and defending against social engineering in secure aerospace & government contractor sites.",
    keyPoints: [
      "Physical badges must remain visible on the outer garment between neck and waist at all times.",
      "Piggybacking or tailgating is strictly prohibited: every individual must scan through access turnstiles independently.",
      "Never leave master key rings unattended or propped on trash carts.",
      "Report any unauthorized personnel or suspicious unattended hardware to facility security immediately."
    ],
    quiz: [
      {
        question: "Under CMMC Physical Protection (PE) standards, what is required when cleaning staff move through restricted doors?",
        options: ["Hold the door open for anyone walking behind them", "Ensure positive door closure and never permit tailgating / piggybacking", "Leave the door wedged open with a doorstop for convenience", "Share master badge pins with crew members"],
        correctIndex: 1,
        explanation: "Tailgating is a severe physical security violation. All doors must positively latch behind each authorized entrant."
      },
      {
        question: "If a master key ring or RFID keycard is misplaced during a shift, what is the required procedure?",
        options: ["Wait until the end of the week to notify management", "Immediately inform SCOMS dispatch and the client facility security team", "Borrow a duplicate from a colleague and ignore the loss", "Attempt to pick the lock"],
        correctIndex: 1,
        explanation: "Loss of physical keys or badges must be escalated immediately to dispatch and facility security for access revocation."
      },
      {
        question: "Are cleaning professionals permitted to photograph client whiteboards, documents, or server screens?",
        options: ["Yes, to show clients proof of clean surfaces", "Strictly prohibited by confidentiality and NDA regulations", "Permitted only on personal social media", "Permitted if the photo is blurry"],
        correctIndex: 1,
        explanation: "Photographing client intellectual property, whiteboards, or computer screens is a direct breach of NDAs and CMMC Level 2 guidelines."
      },
      {
        question: "What should an employee do if an unknown individual asks them to hold open a secure badge door?",
        options: ["Politely open the door to be courteous", "Politely direct them to the main security reception desk to verify their credentials", "Hand them your employee badge", "Ignore the request and walk away without answering"],
        correctIndex: 1,
        explanation: "Security protocol requires all unbadged or unverified individuals to check in at the reception desk or guard station."
      },
      {
        question: "Where should confidential shredded paper recycling bins be deposited?",
        options: ["In open outdoor dumpsters", "In locked security collection consoles according to facility SOP", "In regular hallway waste receptacles", "Taken home by cleaners"],
        correctIndex: 1,
        explanation: "Confidential paper must only be handled through locked security destruction consoles."
      }
    ]
  },
  "Series 4 — Cleaning Excellence": {
    id: "course-3",
    title: "Restroom Excellence & Cross-Contamination Prevention",
    series: "Series 4 — Cleaning Excellence",
    durationMinutes: 20,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    description: "Color-coded microfiber systems, top-to-bottom restroom sanitization, and ATP bioluminescence validation.",
    keyPoints: [
      "Red microfiber cloths and mop heads are strictly reserved for toilet bowls and urinals.",
      "Yellow microfiber cloths are for sinks, mirrors, and counters.",
      "Green microfiber cloths are for general office desks, partitions, and common touchpoints.",
      "Blue microfiber cloths are for glass and chrome polishing."
    ],
    quiz: [
      {
        question: "What microfiber color code is reserved exclusively for high-risk sanitary fixtures (toilets & urinals)?",
        options: ["Green", "Blue", "Red", "White"],
        correctIndex: 2,
        explanation: "Red microfiber is universally designated for toilets and urinals to eliminate cross-contamination into sink or desk areas."
      },
      {
        question: "In what direction should cleaning be executed inside a commercial restroom?",
        options: ["Bottom to top, dirty to clean", "Top to bottom, clean to dirty (toilets last)", "Start with the floor drain first", "Random sequence"],
        correctIndex: 1,
        explanation: "Always clean from top to bottom (dusting, mirrors, sinks, fixtures) and finish with the most contaminated fixtures (toilets/urinals and floor mopping last)."
      },
      {
        question: "What tool is used by SCOMS quality inspectors to scientifically verify surface cleanliness?",
        options: ["Magnifying glass", "ATP Bioluminescence swab meter", "Weight scale", "pH paper strip"],
        correctIndex: 1,
        explanation: "ATP meters measure adenosine triphosphate to provide scientific, quantitative proof of pathogen removal on disinfected surfaces."
      },
      {
        question: "How often should mop water be refreshed when servicing multiple commercial restroom suites?",
        options: ["Once every two weeks", "After every restroom suite or whenever visibly soiled", "Only at the end of the shift", "Never replaced during a shift"],
        correctIndex: 1,
        explanation: "Mop water must be changed after every restroom or whenever clouded to prevent spreading microbial buildup across floors."
      },
      {
        question: "What must be placed at restroom entry doorways before floor wet-mopping begins?",
        options: ["A piece of cardboard", "Yellow OSHA-compliant 'Caution: Wet Floor' safety signs", "A flashlight", "No signs needed"],
        correctIndex: 1,
        explanation: "OSHA slip-and-fall prevention requires prominent 'Caution: Wet Floor' warning signage whenever floors are damp."
      }
    ]
  }
};

interface CoursePlayerModalProps {
  courseTitle?: string;
  seriesName?: string;
  employeeName?: string;
  onClose: () => void;
  onCourseCompleted?: (score: number) => void;
}

export function CoursePlayerModal({
  courseTitle = "Personal Protective Equipment & Chemical Dilution Protocols",
  seriesName = "Series 2 — Safety",
  employeeName = "Alex Rivera (Operations Specialist)",
  onClose,
  onCourseCompleted
}: CoursePlayerModalProps) {
  // Determine course data
  const courseData: CourseData =
    SAMPLE_COURSES[seriesName] ||
    SAMPLE_COURSES[courseTitle] ||
    SAMPLE_COURSES.default;

  const [activeTab, setActiveTab] = useState<"video" | "quiz" | "certificate">("video");
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [videoWatched, setVideoWatched] = useState(false);

  const handleSelectAnswer = (qIdx: number, optIdx: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmitQuiz = () => {
    let correct = 0;
    courseData.quiz.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correct += 1;
      }
    });

    const calculatedScore = Math.round((correct / courseData.quiz.length) * 100);
    setScore(calculatedScore);
    setQuizSubmitted(true);

    if (calculatedScore >= 80) {
      if (onCourseCompleted) {
        onCourseCompleted(calculatedScore);
      }
    }
  };

  const handleRetakeQuiz = () => {
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setScore(null);
  };

  const certificateId = `SCOMS-CERT-${Math.abs(courseData.title.split('').reduce((a,b)=>((a<<5)-a)+b.charCodeAt(0),0)).toString(16).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4 font-display">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                {courseData.series}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white">{courseData.title}</h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Step navigation */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs">
              <button
                onClick={() => setActiveTab("video")}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  activeTab === "video" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                <Play className="w-3.5 h-3.5" /> Video Lecture
              </button>
              <button
                onClick={() => setActiveTab("quiz")}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  activeTab === "quiz" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Certification Quiz
              </button>
              {score !== null && score >= 80 && (
                <button
                  onClick={() => setActiveTab("certificate")}
                  className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                    activeTab === "certificate" ? "bg-emerald-600 text-white" : "text-emerald-400 hover:text-white"
                  }`}
                >
                  <Award className="w-3.5 h-3.5" /> View Certificate
                </button>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: VIDEO */}
          {activeTab === "video" && (
            <div className="space-y-6">
              {/* Video Player Frame */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl flex items-center justify-center">
                <video
                  controls
                  className="w-full h-full object-cover"
                  onEnded={() => setVideoWatched(true)}
                  src={courseData.videoUrl}
                  poster="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80"
                >
                  Your browser does not support HTML5 video streaming.
                </video>
              </div>

              {/* Course Overview & Key Protocols */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-3 bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400" /> Operational Overview
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {courseData.description}
                  </p>

                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider pt-2">
                    Mandatory Operating Standards:
                  </h5>
                  <ul className="space-y-2">
                    {courseData.keyPoints.map((pt, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Module Status
                    </span>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-semibold">{courseData.durationMinutes} Minutes</span>
                    </div>
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-300">
                      Passing Grade Requirement: <strong>80% or Higher</strong> to issue verifiable digital certificate.
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab("quiz")}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 transition"
                  >
                    <span>Proceed to Certification Quiz</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: QUIZ */}
          {activeTab === "quiz" && (
            <div className="space-y-6 max-w-3xl mx-auto">
              {/* Score Banner if Submitted */}
              {quizSubmitted && score !== null && (
                <div
                  className={`p-6 rounded-2xl border text-center space-y-3 ${
                    score >= 80
                      ? "bg-emerald-950/40 border-emerald-500 text-emerald-300"
                      : "bg-rose-950/40 border-rose-500 text-rose-300"
                  }`}
                >
                  <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center bg-white/10 text-2xl font-bold">
                    {score >= 80 ? "🎉" : "⚠️"}
                  </div>
                  <h4 className="text-xl font-bold">
                    {score >= 80 ? "Certification Exam Passed!" : "Passing Score Not Reached"}
                  </h4>
                  <p className="text-sm">
                    You scored <strong>{score}%</strong> ({Math.round((score / 100) * courseData.quiz.length)} of{" "}
                    {courseData.quiz.length} correct). Passing requirement is 80%.
                  </p>

                  <div className="pt-2 flex justify-center gap-3">
                    {score >= 80 ? (
                      <button
                        onClick={() => setActiveTab("certificate")}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition"
                      >
                        View & Print Certificate of Completion
                      </button>
                    ) : (
                      <button
                        onClick={handleRetakeQuiz}
                        className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition flex items-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" /> Retake Exam
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Questions List */}
              <div className="space-y-6">
                {courseData.quiz.map((q, qIdx) => {
                  const selected = selectedAnswers[qIdx];
                  const isCorrect = selected === q.correctIndex;

                  return (
                    <div
                      key={qIdx}
                      className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg">
                          Question {qIdx + 1} of {courseData.quiz.length}
                        </span>
                        {quizSubmitted && (
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded ${
                              isCorrect ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                            }`}
                          >
                            {isCorrect ? "Correct" : "Incorrect"}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-white">{q.question}</h4>

                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => {
                          const isOptionSelected = selected === optIdx;
                          let optionClasses =
                            "p-3 rounded-xl border text-xs sm:text-sm flex items-center gap-3 cursor-pointer transition ";

                          if (quizSubmitted) {
                            if (optIdx === q.correctIndex) {
                              optionClasses += "bg-emerald-950/60 border-emerald-500 text-emerald-200 font-semibold";
                            } else if (isOptionSelected) {
                              optionClasses += "bg-rose-950/60 border-rose-500 text-rose-200";
                            } else {
                              optionClasses += "bg-slate-900 border-slate-800 text-slate-500";
                            }
                          } else {
                            if (isOptionSelected) {
                              optionClasses += "bg-blue-600/20 border-blue-500 text-blue-200 font-medium";
                            } else {
                              optionClasses += "bg-slate-900/60 border-slate-800 hover:bg-slate-800 text-slate-300";
                            }
                          }

                          return (
                            <div
                              key={optIdx}
                              onClick={() => handleSelectAnswer(qIdx, optIdx)}
                              className={optionClasses}
                            >
                              <div
                                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 text-xs ${
                                  isOptionSelected
                                    ? "border-blue-400 bg-blue-500 text-white"
                                    : "border-slate-600 bg-slate-950 text-slate-400"
                                }`}
                              >
                                {String.fromCharCode(65 + optIdx)}
                              </div>
                              <span>{opt}</span>
                            </div>
                          );
                        })}
                      </div>

                      {quizSubmitted && (
                        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400 mt-2">
                          <strong className="text-slate-200">Protocol Rationale:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!quizSubmitted && (
                <div className="pt-4 flex justify-end">
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(selectedAnswers).length < courseData.quiz.length}
                    className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-900/30 transition"
                  >
                    Submit Exam & Score
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CERTIFICATE */}
          {activeTab === "certificate" && (
            <div className="space-y-6 max-w-3xl mx-auto py-4">
              <div className="bg-white text-slate-900 p-8 sm:p-12 rounded-3xl border-8 border-slate-100 shadow-2xl relative overflow-hidden">
                {/* Certificate Watermark Accent */}
                <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-blue-50/50 pointer-events-none" />
                <div className="border-4 border-double border-indigo-900/20 p-6 sm:p-10 rounded-2xl text-center space-y-6">
                  <div className="flex items-center justify-center gap-2">
                    <Award className="w-12 h-12 text-amber-500" />
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase text-indigo-950 font-serif">
                      Certificate of Completion
                    </h2>
                    <p className="text-xs uppercase tracking-widest text-slate-500 font-sans">
                      Secure Cleaning Operations Academy · Operational Compliance
                    </p>
                  </div>

                  <p className="text-sm text-slate-600 italic">This certifies that</p>

                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 border-b-2 border-slate-300 pb-2 inline-block px-8">
                    {employeeName}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
                    has successfully satisfied all rigorous practical knowledge standards, OSHA regulatory requirements, and score examinations for:
                  </p>

                  <div className="bg-slate-50 py-3 px-6 rounded-xl inline-block border border-slate-200">
                    <p className="text-base sm:text-lg font-extrabold text-indigo-950">{courseData.title}</p>
                    <p className="text-xs text-slate-500 font-semibold">{courseData.series}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200 text-left text-xs text-slate-500 font-mono">
                    <div>
                      <p className="font-bold text-slate-700">DATE ISSUED</p>
                      <p>{new Date().toLocaleDateString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-emerald-700">EXAM SCORE</p>
                      <p className="text-sm font-bold text-emerald-700">{score ?? 100}% (PASSED)</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-700">VERIFICATION ID</p>
                      <p className="truncate">{certificateId}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => window.print()}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 transition"
                >
                  <Printer className="w-4 h-4" /> Print Certificate
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl transition"
                >
                  Complete Module & Save
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
