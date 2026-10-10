export interface Question {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  timeLimit: number;
  explanation: string;
  category: 'AI & ML' | 'Python & DSA' | 'Cyber Security' | 'Tech Trivia' | 'CMRTC Special';
  points: number;
  type?: 'single' | 'code' | 'hacker' | 'true-false' | 'text' | 'image';
  codeSnippet?: string;
  imageUrl?: string;
}

export interface QuizSet {
  id: string;
  title: string;
  description: string;
  category: string;
  questionCount: number;
  timeEstimate: string;
  plays: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  badge: string;
  questions: Question[];
}

export const SAMPLE_QUIZZES: QuizSet[] = [
  {
    id: 'ai-ml-grand-battle',
    title: 'AI & Machine Learning Grand Battle',
    description: 'From Transformers and Backpropagation to LLMs and CNN architectures. Tested in Round 1 Prelims.',
    category: 'AI & ML',
    questionCount: 6,
    timeEstimate: '5 mins',
    plays: 1240,
    difficulty: 'Medium',
    badge: 'Popular',
    questions: [
      {
        id: 'q1',
        question: 'Which neural network architecture introduced the Self-Attention mechanism?',
        options: ['Transformers', 'Recurrent Neural Networks (RNN)', 'LeNet CNN', 'Hopfield Networks'],
        correctIndex: 0,
        timeLimit: 15,
        explanation: 'The Transformer architecture was introduced in the landmark 2017 paper "Attention Is All You Need" by Vaswani et al.',
        category: 'AI & ML',
        points: 1000
      },
      {
        id: 'q2',
        question: 'What does the term "Temperature" control in Large Language Model (LLM) generation?',
        options: ['Processing chip cooling rate', 'Randomness & creativity of token output', 'Learning rate schedule', 'Context window token capacity'],
        correctIndex: 1,
        timeLimit: 15,
        explanation: 'Higher temperature increases probability distribution entropy, making outputs more random and creative; lower temperature makes it deterministic.',
        category: 'AI & ML',
        points: 1000
      },
      {
        id: 'q3',
        question: 'In Deep Learning optimization, which optimizer combines the benefits of AdaGrad and RMSProp?',
        options: ['SGD with Momentum', 'Adam (Adaptive Moment Estimation)', 'L-BFGS', 'Nesterov Accelerated Gradient'],
        correctIndex: 1,
        timeLimit: 15,
        explanation: 'Adam computes adaptive learning rates for each parameter by storing both the first moment (mean) and second moment (uncentered variance).',
        category: 'AI & ML',
        points: 1000
      },
      {
        id: 'q4',
        question: 'What is the vanishing gradient problem primarily caused by in deep networks?',
        options: ['ReLU activation saturation', 'Repeated multiplication of small derivatives (e.g. Sigmoid)', 'Too large learning rate', 'Over-regularization with L2 decay'],
        correctIndex: 1,
        timeLimit: 15,
        explanation: 'Sigmoid derivatives have a max value of 0.25. Multiplying them across many layers causes gradients to approach zero exponentially.',
        category: 'AI & ML',
        points: 1000
      },
      {
        id: 'q5',
        question: 'Which metric is best suited to evaluate classification models on severely imbalanced datasets?',
        options: ['Accuracy', 'ROC-AUC & F1-Score', 'Mean Squared Error (MSE)', 'R-Squared Score'],
        correctIndex: 1,
        timeLimit: 15,
        explanation: 'Accuracy is misleading when classes are imbalanced (e.g. 99% negative). F1-Score and Precision-Recall/ROC-AUC capture performance accurately.',
        category: 'AI & ML',
        points: 1000
      },
      {
        id: 'q6',
        question: 'What technique allows pre-trained models to efficiently adapt to new tasks using low-rank matrices?',
        options: ['LoRA (Low-Rank Adaptation)', 'Batch Normalization', 'Gradient Clipping', 'Knowledge Distillation'],
        correctIndex: 0,
        timeLimit: 15,
        explanation: 'LoRA freezes pre-trained model weights and injects trainable rank decomposition matrices into each layer, drastically reducing trainable parameters.',
        category: 'AI & ML',
        points: 1000
      }
    ]
  },
  {
    id: 'python-bug-hunt',
    title: 'Python & Logic Gates: Bug Hunter Round',
    description: 'Tricky Python execution questions, mutable default arguments, and computational complexity.',
    category: 'Python & DSA',
    questionCount: 4,
    timeEstimate: '4 mins',
    plays: 890,
    difficulty: 'Hard',
    badge: 'Code Round',
    questions: [
      {
        id: 'pq1',
        question: 'What will this Python snippet output?\ndef append_to(val, lst=[]):\n    lst.append(val)\n    return lst\nprint(append_to(1), append_to(2))',
        options: ['[1] [2]', '[1] [1, 2]', '[1, 2] [1, 2]', 'TypeError: mutable default'],
        correctIndex: 2,
        timeLimit: 20,
        explanation: 'In Python, default arguments are evaluated only once at definition time, so the same list is mutated across function calls!',
        category: 'Python & DSA',
        points: 1200
      },
      {
        id: 'pq2',
        question: 'What is the average time complexity of searching a key in a Python dictionary (hash map)?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        correctIndex: 0,
        timeLimit: 12,
        explanation: 'Python dictionaries use open-addressing hash tables, providing average O(1) lookup, insertion, and deletion time.',
        category: 'Python & DSA',
        points: 1000
      },
      {
        id: 'pq3',
        question: 'What does the "GIL" in CPython stand for and what is its primary effect?',
        options: ['General Instruction Layer (limits bytecode)', 'Global Interpreter Lock (prevents multi-core pure Python threads)', 'Graph Interface Linker (manages C bindings)', 'Garbage Isolation Loop (frees memory)'],
        correctIndex: 1,
        timeLimit: 15,
        explanation: 'The Global Interpreter Lock ensures only one native thread executes Python bytecode at a time in CPython.',
        category: 'Python & DSA',
        points: 1000
      },
      {
        id: 'pq4',
        question: 'In Python, what is the output of `bool("False")`?',
        options: ['False', 'True', 'None', 'ValueError'],
        correctIndex: 1,
        timeLimit: 10,
        explanation: 'Any non-empty string in Python evaluates to True in boolean context, even if the string is "False" or "0"!',
        category: 'Python & DSA',
        points: 800
      }
    ]
  },
  {
    id: 'cyber-hacker-mode',
    title: 'Cyber Security & Ethical Hacking (Hacker_ Mode)',
    description: 'Cryptography, network defense, penetration testing, and zero-day defense for Hacker Mode.',
    category: 'Cyber Security',
    questionCount: 4,
    timeEstimate: '4 mins',
    plays: 640,
    difficulty: 'Hard',
    badge: 'Hacker_',
    questions: [
      {
        id: 'cq1',
        question: 'Which cryptographic algorithm is asymmetric and based on prime factorization difficulty?',
        options: ['AES-256', 'RSA', 'SHA-512', 'ChaCha20'],
        correctIndex: 1,
        timeLimit: 15,
        explanation: 'RSA (Rivest-Shamir-Adleman) relies on the computational difficulty of factoring the product of two large prime numbers.',
        category: 'Cyber Security',
        points: 1000
      },
      {
        id: 'cq2',
        question: 'What type of cyber attack injects malicious scripts into trusted websites viewed by other users?',
        options: ['Cross-Site Scripting (XSS)', 'SQL Injection', 'Man-In-The-Middle (MITM)', 'Buffer Overflow'],
        correctIndex: 0,
        timeLimit: 15,
        explanation: 'XSS enables attackers to inject client-side scripts into web pages viewed by other users to hijack sessions or steal credentials.',
        category: 'Cyber Security',
        points: 1000
      },
      {
        id: 'cq3',
        question: 'In zero-trust architecture, what is the core foundational principle?',
        options: ['Trust intranet, verify internet', 'Never trust, always verify', 'Encrypt only outward traffic', 'Require passwords every 5 minutes'],
        correctIndex: 1,
        timeLimit: 12,
        explanation: 'Zero Trust assumes no implicit trust granted to assets or user accounts based solely on their physical or network location.',
        category: 'Cyber Security',
        points: 1000
      },
      {
        id: 'cq4',
        question: 'Which port number does HTTPS default to?',
        options: ['80', '8080', '443', '22'],
        correctIndex: 2,
        timeLimit: 10,
        explanation: 'Port 443 is the standard port for HTTPS traffic encrypted with SSL/TLS.',
        category: 'Cyber Security',
        points: 800
      }
    ]
  },
  {
    id: 'cmrtc-campus-trivia',
    title: 'CMRTC Tech & AI Club Champions Quiz',
    description: 'CMR Technical Campus history, AI club milestones, and computer science breakthroughs.',
    category: 'CMRTC Special',
    questionCount: 4,
    timeEstimate: '3 mins',
    plays: 1580,
    difficulty: 'Easy',
    badge: 'Campus Special',
    questions: [
      {
        id: 'cmr1',
        question: 'Which club at CMR Technical Campus organizes the Battle of Bits live quiz championship?',
        options: ['AI CLUB CMRTC', 'Robotics Club', 'Coding Ninjas CMRTC', 'IEEE CMRTC Student Branch'],
        correctIndex: 0,
        timeLimit: 10,
        explanation: 'The AI CLUB CMRTC is the official student-led AI & emerging technologies society at CMR Technical Campus!',
        category: 'CMRTC Special',
        points: 1000
      },
      {
        id: 'cmr2',
        question: 'Who is widely regarded as the "Father of Artificial Intelligence"?',
        options: ['Alan Turing', 'John McCarthy', 'Geoffrey Hinton', 'Claude Shannon'],
        correctIndex: 1,
        timeLimit: 15,
        explanation: 'John McCarthy coined the term "Artificial Intelligence" in 1955 and organized the famous 1956 Dartmouth Conference.',
        category: 'CMRTC Special',
        points: 1000
      },
      {
        id: 'cmr3',
        question: 'Which year was the famous Turing Test proposed by Alan Turing?',
        options: ['1950', '1965', '1972', '1942'],
        correctIndex: 0,
        timeLimit: 12,
        explanation: 'Alan Turing published "Computing Machinery and Intelligence" in 1950 introducing the "Imitation Game".',
        category: 'CMRTC Special',
        points: 1000
      },
      {
        id: 'cmr4',
        question: 'Which branch at CMRTC focuses on Artificial Intelligence & Machine Learning?',
        options: ['CSE (AI & ML)', 'Mechanical Engineering', 'Civil Engineering', 'Aeronautical Sciences'],
        correctIndex: 0,
        timeLimit: 10,
        explanation: 'The Department of CSE (AI & ML) at CMR Technical Campus powers cutting-edge deep learning and research labs.',
        category: 'CMRTC Special',
        points: 1000
      }
    ]
  }
];

export const MOCK_LEADERBOARD: any[] = [];

export const CHOICE_ICONS = ['▲', '◆', '⬤', '■'];
export const CHOICE_COLORS = [
  'bg-choice-red hover:bg-choice-red-hover text-white',
  'bg-choice-blue hover:bg-choice-blue-hover text-white',
  'bg-choice-yellow hover:bg-choice-yellow-hover text-white',
  'bg-choice-green hover:bg-choice-green-hover text-white',
];
