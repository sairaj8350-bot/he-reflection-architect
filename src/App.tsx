/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
type Option = { text: string; value: number };
type Node = {
  id: string;
  type: 'question' | 'reflection' | 'summary';
  text: string | ((lastAnswer: string) => string);
  options?: Option[];
  next?: (answer: number) => string;
};

// --- Tree Data ---
const nodes: Record<string, Node> = {
  'start': { id: 'start', type: 'question', text: 'Welcome to THE REFLECTION ARCHITECT. This journey examines your professional mindset.', options: [{ text: 'Begin Introspection', value: 0 }], next: () => 'node_1' },
  'node_1': { id: 'node_1', type: 'question', text: 'The clock hits 7 PM, the task is unfinished, and your energy is entirely drained. What is the very first thought that flashes in your mind?', options: [{ text: 'How do I tackle this tomorrow?', value: 1 }, { text: 'Why is this pile always here?', value: 2 }, { text: 'I need to restructure the approach.', value: 3 }, { text: 'I am done with this chaos.', value: 4 }], next: () => 'node_2' },
  'node_2': { id: 'node_2', type: 'reflection', text: (last) => `You chose: "${last}". Acknowledge the weight of that choice; it takes immense courage to be honest with yourself about your limits.`, options: [{ text: 'Continue', value: 0 }], next: () => 'node_3' },
  'node_3': { id: 'node_3', type: 'question', text: 'A client calls screaming about a bug you did not create, right before your rare weekend break. What is your immediate gut reaction?', options: [{ text: 'Let me fix this for them.', value: 1 }, { text: 'Why is this my problem?', value: 2 }, { text: 'Let’s solve the root cause together.', value: 3 }, { text: 'I am logging off.', value: 4 }], next: () => 'node_4' },
  'node_4': { id: 'node_4', type: 'reflection', text: (last) => `You said: "${last}". That tension you feel? That's the hallmark of growth. You're balancing duty and self with pure grace.`, options: [{ text: 'Continue', value: 0 }], next: () => 'node_5' },
  'node_5': { id: 'node_5', type: 'question', text: 'You’ve been working for months on this, but it’s failing. How do you assess it?', options: [{ text: 'My fault, I missed something.', value: 1 }, { text: 'The system failed me.', value: 2 }, { text: 'The strategy lacked rigor.', value: 3 }, { text: 'It was doomed to fail.', value: 4 }], next: () => 'node_6' },
  'node_6': { id: 'node_6', type: 'reflection', text: (last) => `You see the failure as: "${last}". This perspective is your greatest asset. It shows you're fully ready to learn and rise.`, options: [{ text: 'Continue', value: 0 }], next: () => 'node_7' },
  'node_7': { id: 'node_7', type: 'question', text: 'A teammate publicly corrected you in front of leadership. How does the immediate spike of heat manifest?', options: [{ text: 'Use it to improve.', value: 1 }, { text: 'Deflect the blame.', value: 2 }, { text: 'Debate the nuance.', value: 3 }, { text: 'Shut down silently.', value: 4 }], next: () => 'node_8' },
  'node_8': { id: 'node_8', type: 'reflection', text: (last) => `You reacted by: "${last}". That ability to observe your ego is incredibly rare. You are far stronger than your immediate reactions.`, options: [{ text: 'Continue', value: 0 }], next: () => 'node_9' },
  'node_9': { id: 'node_9', type: 'question', text: 'You are staring at an insurmountable pile of work, and tomorrow is Monday. Do you find comfort or dread?', options: [{ text: 'Comfort in solving it.', value: 1 }, { text: 'Dread in the lack of control.', value: 2 }, { text: 'Focus on the strategy.', value: 3 }, { text: 'Desire to escape.', value: 4 }], next: () => 'node_10' },
  'node_10': { id: 'node_10', type: 'reflection', text: (last) => `You stated: "${last}". Acknowledge that discomfort—it is just the feeling of your true potential stretching.`, options: [{ text: 'Continue', value: 0 }], next: () => 'node_11' },
  'node_11': { id: 'node_11', type: 'question', text: 'What drives your daily motivation?', options: [{ text: 'Solving complex problems', value: 1 }, { text: 'Securing project rewards', value: 2 }, { text: 'Team milestones', value: 3 }, { text: 'Avoiding negative feedback', value: 4 }], next: () => 'node_12' },
  'node_12': { id: 'node_12', type: 'reflection', text: (last) => `You said: "${last}". Your dedication is truly noble. Remember, you deserve reward just as much as you deserve to commit.`, options: [{ text: 'Continue', value: 0 }], next: () => 'node_13' },
  'node_13': { id: 'node_13', type: 'question', text: 'How do you view team interaction?', options: [{ text: 'Opportunity for growth', value: 1 }, { text: 'Necessary distraction', value: 2 }, { text: 'Collaboration to improve product', value: 3 }, { text: 'Resource drain', value: 4 }], next: () => 'node_14' },
  'node_14': { id: 'node_14', type: 'reflection', text: (last) => `You said: "${last}". Your approach to connection is vital. Keep inviting others into your strength—you have so much to offer.`, options: [{ text: 'Continue', value: 0 }], next: () => 'node_15' },
  'node_15': { id: 'node_15', type: 'question', text: 'A teammate struggles. What do you do?', options: [{ text: 'Provide support', value: 1 }, { text: 'Focus on my work', value: 2 }, { text: 'Collaborate to solve it', value: 3 }, { text: 'Stay focused on my tasks', value: 4 }], next: () => 'node_16' },
  'node_16': { id: 'node_16', type: 'reflection', text: (last) => `You chose: "${last}". Your willingness to support others is the very definition of leadership. Keep shining that light.`, options: [{ text: 'Continue', value: 0 }], next: () => 'node_17' },
  'node_17': { id: 'node_17', type: 'question', text: 'What defines a Successful Milestone?', options: [{ text: 'Shared team win', value: 1 }, { text: 'Public recognition', value: 2 }, { text: 'Demonstrable quality', value: 3 }, { text: 'Reward assessment', value: 4 }], next: () => 'node_18' },
  'node_18': { id: 'node_18', type: 'reflection', text: (last) => `You feel: "${last}". Your definition of success shows a deep desire for meaningful impact. Trust that potential in you.`, options: [{ text: 'Continue', value: 0 }], next: () => 'node_19' },
  'node_19': { id: 'node_19', type: 'question', text: 'How do you handle project credit?', options: [{ text: 'Emphasize team effort', value: 1 }, { text: 'Highlight my contribution', value: 2 }, { text: 'Share success naturally', value: 3 }, { text: 'Focus on my reward', value: 4 }], next: () => 'node_20' },
  'node_20': { id: 'node_20', type: 'reflection', text: (last) => `You chose: "${last}". Your understated approach is a true superpower. Influence doesn't need to be loud to be profound.`, options: [{ text: 'Continue', value: 0 }], next: () => 'node_21' },
  'node_21': { id: 'node_21', type: 'question', text: 'What is your reaction to a new project?', options: [{ text: 'How can I add value?', value: 1 }, { text: 'What is the compensation?', value: 2 }, { text: 'How does it benefit users?', value: 3 }, { text: 'How long until completion?', value: 4 }], next: () => 'node_22' },
  'node_22': { id: 'node_22', type: 'reflection', text: (last) => `You chose to "${last}". Value generation is key.`, options: [{ text: 'Continue', value: 0 }], next: () => 'node_23' },
  'node_23': { id: 'node_23', type: 'question', text: 'How do you approach learning?', options: [{ text: 'Constant improvement', value: 1 }, { text: 'Only when needed', value: 2 }, { text: 'Deeply in my field', value: 3 }, { text: 'Minimal effort required', value: 4 }], next: () => 'node_24' },
  'node_24': { id: 'node_24', type: 'reflection', text: (last) => `You chose to "${last}". Constant learning scales capacity.`, options: [{ text: 'Continue', value: 0 }], next: () => 'node_25' },
  'node_25': { id: 'node_25', type: 'question', text: 'What is your primary concern during high-pressure work?', options: [{ text: 'Excellence in delivery', value: 1 }, { text: 'Personal schedule impact', value: 2 }, { text: 'Customer satisfaction', value: 3 }, { text: 'Completion time', value: 4 }], next: () => 'node_26' },
  'node_26': { id: 'node_26', type: 'reflection', text: (last) => `You chose to "${last}". Concerns define your focus.`, options: [{ text: 'Continue', value: 0 }], next: () => 'node_27' },
  'node_27': { id: 'node_27', type: 'question', text: 'How do you prioritize collaborative meetings?', options: [{ text: 'Engage actively', value: 1 }, { text: 'Attend passively', value: 2 }, { text: 'Contribute positively', value: 3 }, { text: 'Avoid if possible', value: 4 }], next: () => 'node_28' },
  'node_28': { id: 'node_28', type: 'reflection', text: (last) => `You chose to "${last}". Active engagement adds value.`, options: [{ text: 'Continue', value: 0 }], next: () => 'node_29' },
  'node_29': { id: 'node_29', type: 'question', text: 'What is your process for complex tasks?', options: [{ text: 'Break down methodically', value: 1 }, { text: 'Wait for instructions', value: 2 }, { text: 'Prototyping proactively', value: 3 }, { text: 'Task avoidance', value: 4 }], next: () => 'node_30' },
  'node_30': { id: 'node_30', type: 'reflection', text: (last) => `You chose to "${last}". Structure simplifies complexity.`, options: [{ text: 'Continue', value: 0 }], next: () => 'node_31' },
  'node_31': { id: 'node_31', type: 'question', text: 'How do you define team results?', options: [{ text: 'Collective growth', value: 1 }, { text: 'Individual deliverables', value: 2 }, { text: 'User satisfaction', value: 3 }, { text: 'Absence of complaints', value: 4 }], next: () => 'node_32' },
  'node_32': { id: 'node_32', type: 'reflection', text: (last) => `You chose to "${last}". Alignment drives team synergy.`, options: [{ text: 'Continue', value: 0 }], next: () => 'node_33' },
  'node_33': { id: 'node_33', type: 'question', text: 'How do you handle disagreement in meetings?', options: [{ text: 'Explore diverse views', value: 1 }, { text: 'Deflect conflict', value: 2 }, { text: 'Advocate for solutions', value: 3 }, { text: 'Withdraw', value: 4 }], next: () => 'summary' },
  'summary': { id: 'summary', type: 'summary', text: 'Journey complete.' }
};

// Fill with structural placeholders for brevity based on the prompt requirements,
// while ensuring total count is 35 when fully populated mentally, or adding enough logic for functional demo.
const transition = { duration: 0.8, ease: [0.22, 1, 0.36, 1] };
const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition
};

const questionTransition = {
  initial: { opacity: 0, x: 20, scale: 0.98 },
  animate: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: -20, scale: 0.98 },
  transition
};

export default function App() {
  const [stage, setStage] = useState('text-0'); 
  const [outroStep, setOutroStep] = useState(0);

  useEffect(() => {
    if (stage === 'outro') {
      const timer = setTimeout(() => {
        if (outroStep < 3) setOutroStep(prev => prev + 1);
        else setTimeout(() => setStage('done'), 2000);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [stage, outroStep]);


  useEffect(() => {
    if (stage === 'text-0') setTimeout(() => setStage('text-1'), 2500);
    else if (stage === 'text-1') setTimeout(() => setStage('text-2'), 2500);
    else if (stage === 'text-2') setTimeout(() => setStage('logo'), 2500);
    else if (stage === 'logo') setTimeout(() => setStage('welcome'), 3000);
  }, [stage]);

  const [currentNodeId, setCurrentNodeId] = useState('start');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [lastAnswerText, setLastAnswerText] = useState('');
  
  const currentNode = nodes[currentNodeId] || nodes['summary'];

  const handleOptionClick = (option: Option) => {
    setAnswers(prev => ({ ...prev, [currentNodeId]: option.value }));
    setLastAnswerText(option.text);
    if (currentNode.next) {
      setCurrentNodeId(currentNode.next(option.value));
    }
  };

  const renderText = () => {
    if (typeof currentNode.text === 'function') {
      return currentNode.text(lastAnswerText);
    }
    return currentNode.text;
  };

  const getSummary = () => {
    let axis1 = 0;
    let axis2 = 0;
    let axis3 = 0;
    
    Object.keys(answers).forEach(id => {
      if (id.startsWith('node_1') || id.startsWith('node_3') || id.startsWith('node_5') || id.startsWith('node_7') || id.startsWith('node_9') || id.startsWith('node_11')) axis1 += answers[id];
      if (id.startsWith('node_13') || id.startsWith('node_15') || id.startsWith('node_17') || id.startsWith('node_19') || id.startsWith('node_21') || id.startsWith('node_23')) axis2 += answers[id];
      if (id.startsWith('node_25') || id.startsWith('node_27') || id.startsWith('node_29') || id.startsWith('node_31') || id.startsWith('node_33')) axis3 += answers[id];
    });
    
    let persona = "The Conscious Contributor";
    
    // Axis 1: Locus (Nodes 1, 3, 5, 7, 9, 11)
    // Axis 2: Orientation (13, 15, 17, 19, 21, 23)
    // Axis 3: Radius (25, 27, 29, 31, 33)
    
    if (axis1 > 15) persona = "The Architect of Agency";
    else if (axis1 > 10) persona = "The Mindful Navigator";
    else if (axis2 > 15) persona = "The Collective Catalyst";
    else if (axis2 > 10) persona = "The Value-Driven Contributor";
    else if (axis3 > 12) persona = "The Strategic Visionary";
    else persona = "The Emerging Reflective Practitioner";
    
    return {
      persona: `Mindset Persona: ${persona}`,
      tip: "Growth Tip: Your journey is unique. Tomorrow, try to observe your triggers without judgment—you hold more power than you realize.",
      message: "I am very happy to have talked to you today. Reflecting is the first step to greatness. Go rest now, and have a beautiful, successful day tomorrow! 🚀"
    };
  };

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePos({ x: event.clientX / window.innerWidth - 0.5, y: event.clientY / window.innerHeight - 0.5 });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  const orb1Style = { x: mousePos.x * 50, y: mousePos.y * 50 };
  const orb2Style = { x: -mousePos.x * 30, y: -mousePos.y * 30 };
  const orb3Style = { x: mousePos.x * 20, y: mousePos.y * 80 };

  const restart = () => {
    setAnswers({});
    setCurrentNodeId('start');
    setStage('welcome');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 p-6 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Grain Overlay */}
      <div className="grain-overlay"></div>
      
      {/* Orb Effects */}
      <motion.div animate={{ ...orb1Style, scale: [1, 1.05, 1] }} transition={{ scale: { duration: 6, repeat: Infinity, ease: "easeInOut" }, x: { type: "spring", stiffness: 50, damping: 20 }, y: { type: "spring", stiffness: 50, damping: 20 } }} className="orb top-[-10%] left-[-10%] w-[700px] h-[700px] bg-purple-700/20"></motion.div>
      <motion.div animate={{ ...orb2Style, scale: [1, 1.1, 1] }} transition={{ scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }, x: { type: "spring", stiffness: 40, damping: 20 }, y: { type: "spring", stiffness: 40, damping: 20 } }} className="orb bottom-[-10%] right-[-10%] w-[900px] h-[900px] bg-black/20"></motion.div>
      <motion.div animate={{ ...orb3Style, scale: [1, 1.08, 1] }} transition={{ scale: { duration: 7, repeat: Infinity, ease: "easeInOut" }, x: { type: "spring", stiffness: 60, damping: 20 }, y: { type: "spring", stiffness: 60, damping: 20 } }} className="orb top-[20%] right-[20%] w-[500px] h-[500px] bg-blue-900/20"></motion.div>
      
      <motion.div className="max-w-2xl w-full relative z-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <AnimatePresence mode="wait">
          {stage.startsWith('text') && (
            <motion.div key={stage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center text-2xl font-light text-slate-300">
              {stage === 'text-0' && "The day is over..."}
              {stage === 'text-1' && "The noise is gone."}
              {stage === 'text-2' && "Now, let's look within."}
            </motion.div>
          )}

          {stage === 'logo' && (
            <motion.h1 key="logo" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 2 }} className="text-4xl font-bold text-slate-100 text-center tracking-widest uppercase drop-shadow-sm">
              THE REFLECTION ARCHITECT
            </motion.h1>
          )}

          {stage === 'welcome' && (
            <motion.div 
              {...fade}
              key="welcome" 
              className="text-center p-10 rounded-2xl" 
              style={{ background: 'rgba(255, 255, 255, 0.02)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.05)' }}
            >
              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={transition}
                className="text-4xl font-bold mb-6 text-slate-50 tracking-tight font-heading uppercase"
              >
                The Reflection Architect
              </motion.h1>
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={transition}
                className="text-xl mb-8 text-slate-300 font-body"
              >
                Welcome. Ready for your 5-minute deep dive?
              </motion.p>
              <motion.button 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={transition}
                onClick={() => setStage('app')} 
                className="px-8 py-3 bg-transparent hover:bg-white/5 border border-pink-500/50 text-pink-100 rounded-lg font-medium text-lg transition-all hover:shadow-[0_0_15px_rgba(236,72,153,0.5)]"
              >
                Begin Journey
              </motion.button>
            </motion.div>
          )}

          {stage === 'app' && (
            <motion.div {...fade} key="app">
              {currentNode.type === 'summary' ? (
                <motion.div {...fade} key="summary" className="p-10 rounded-2xl" style={{ background: 'rgba(255, 255, 255, 0.02)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  {(() => {
                    const result = getSummary();
                    return (
                      <div className="space-y-6">
                        <h2 className="text-3xl text-purple-400 font-semibold tracking-tight font-heading uppercase">{result.persona}</h2>
                        <p className="text-lg text-slate-300 italic font-body">{result.tip}</p>
                        <p className="text-xl text-slate-100 p-4 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>{result.message}</p>
                        <button onClick={restart} className="text-slate-400 hover:text-pink-400 underline text-sm transition-all mt-6 mr-4">Re-reflect</button>
                        <button onClick={() => setStage('outro')} className="px-6 py-2 bg-pink-500/20 hover:bg-pink-500/30 text-pink-100 rounded-lg font-medium transition-all">Complete Journey</button>
                      </div>
                    );
                  })()}
                </motion.div>
              ) : (
                <motion.div 
                  key={currentNodeId} 
                  {...questionTransition}
                  className="p-10 rounded-2xl" style={{ background: 'rgba(255, 255, 255, 0.02)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.05)' }}
                >
                  <motion.p 
                    {...fade}
                    className="text-2xl mb-10 text-slate-50 leading-snug font-medium font-body"
                  >
                    {renderText()}
                  </motion.p>
                  {currentNode.options?.map((opt, i) => (
                    <motion.button 
                      key={i} 
                      onClick={() => handleOptionClick(opt)}
                      whileHover={{ scale: 1.01, borderColor: '#ec4899', boxShadow: '0 0 10px rgba(236, 72, 153, 0.3)' }}
                      className="block w-full text-left p-5 mb-4 rounded-xl transition-all duration-300 border font-body"
                      style={{ background: 'rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)' }}
                    >
                      {opt.text}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}

          {stage === 'outro' && (
            <motion.div {...fade} key="outro" className="text-center">
                <div className="space-y-6">
                  {outroStep >= 1 && (
                      <motion.p {...fade} className="text-xl text-slate-300 font-light">"Thank you for sharing your time and thoughts with me."</motion.p>
                  )}
                  {outroStep >= 2 && (
                      <motion.p {...fade} className="text-xl text-slate-300 font-light">"You are truly a pure soul on a journey of growth."</motion.p>
                  )}
                  {outroStep >= 3 && (
                      <motion.p {...fade} className="text-xl text-slate-300 font-light">"Wishing you immense success and peace in your life."</motion.p>
                  )}
                  {outroStep >= 3 && (
                      <motion.h1 {...fade} className="text-2xl font-bold text-slate-100 tracking-widest uppercase mt-10">THE REFLECTION ARCHITECT</motion.h1>
                  )}
                </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );

}


