export interface AdminUser {
  id: string;
  email: string;
  username: string;
  name: string;
  role: string;
  department: string;
  passwordHash: string;
  avatar: string;
}

// Single Master Administrator Account with full access over the entire platform
export const MASTER_ADMIN: AdminUser = {
  id: 'master-admin',
  email: 'admin@cmrtc.ac.in',
  username: 'admin',
  name: 'Master Admin (AI CLUB CMRTC)',
  role: 'Chief Super Admin & Quiz Lead',
  department: 'AI CLUB CMRTC',
  passwordHash: 'cmrtc@admin2026',
  avatar: '⚡'
};

// Quiz Batch / Round definition for multi-round tournaments
export interface QuizBatch {
  id: string;
  name: string; // e.g. "Round 1: Screening & Fundamentals"
  description: string;
  roundNumber: number;
  isPublished: boolean; // Confidential until published by admin
  createdAt: string;
}

export const INITIAL_QUIZ_BATCHES: QuizBatch[] = [
  {
    id: 'batch-1',
    name: 'Round 1: Screening & Fundamentals',
    description: 'Prelims round covering core AI fundamentals, Python syntax, and CS essentials.',
    roundNumber: 1,
    isPublished: true,
    createdAt: '2026-10-09'
  },
  {
    id: 'batch-2',
    name: 'Round 2: Technical Deep Dive & Diagrams',
    description: 'Semi-finals featuring neural network architecture diagrams, DSA complexity, and cyber security.',
    roundNumber: 2,
    isPublished: false,
    createdAt: '2026-10-09'
  },
  {
    id: 'batch-3',
    name: 'Round 3: Grand Finale & Rapid Fire',
    description: 'Final championship round with high-speed timers (10s) and advanced machine learning challenges.',
    roundNumber: 3,
    isPublished: false,
    createdAt: '2026-10-09'
  }
];

export interface StoredQuestion {
  id: string;
  question: string;
  type: 'text' | 'image';
  imageUrl?: string;
  options: string[];
  correctIndex: number;
  timeLimit: number; // Configurable timer per question in seconds
  explanation: string;
  category: 'AI & ML' | 'Python & DSA' | 'Cyber Security' | 'Tech Trivia' | 'CMRTC Special';
  points: number;
  batchId: string; // Belongs to a specific Quiz Round Batch
  createdBy: string;
  createdAt: string;
}

export interface Participant {
  id: string;
  name: string;
  branch: string;
  year: string;
  score: number;
  streak: number;
  accuracy: string;
  avatar: string;
  joinedAt: string;
}

export const LEGACY_DUMMY_NAMES = new Set([
  'suhas reddy',
  'ananya sharma',
  'karthik varma',
  'deepika rao',
  'vikram joshi',
  'neha chowdary',
  'pranav teja',
  'bhavana k.',
  'bhavana k'
]);

export const isRealParticipant = (p: any): boolean => {
  if (!p || typeof p.name !== 'string') return false;
  const nameLower = p.name.trim().toLowerCase();
  if (!nameLower) return false;
  if (LEGACY_DUMMY_NAMES.has(nameLower)) return false;
  if (typeof p.id === 'string' && /^p-[1-8]$/.test(p.id)) return false;
  return true;
};

// Official AI Club CMRTC Logo
export const DEFAULT_AI_CLUB_LOGO = '/ai-club-logo.png';

export const INITIAL_STORED_QUESTIONS: StoredQuestion[] = [
  // ================= BATCH 1 / ROUND 1 QUESTIONS =================
  {
    id: 'q-b1-1',
    batchId: 'batch-1',
    question: 'In deep learning, which mechanism allows the transformer model to capture long-range token relationships simultaneously?',
    type: 'text',
    options: ['Self-Attention Mechanism', 'Convolution Striding', 'Hidden Markov States', 'Gradient Vanishing'],
    correctIndex: 0,
    timeLimit: 15,
    explanation: 'Self-Attention enables all token representations to interact directly with all others in parallel via Query, Key, and Value matrices.',
    category: 'AI & ML',
    points: 1000,
    createdBy: 'Master Admin',
    createdAt: '2026-10-09'
  },
  {
    id: 'q-b1-2',
    batchId: 'batch-1',
    question: 'What is the worst-case time complexity of searching an element in a balanced Binary Search Tree (AVL / Red-Black Tree)?',
    type: 'text',
    options: ['O(log n)', 'O(n)', 'O(1)', 'O(n log n)'],
    correctIndex: 0,
    timeLimit: 15,
    explanation: 'A balanced binary search tree maintains a height of log2(n), giving O(log n) worst-case search complexity.',
    category: 'Python & DSA',
    points: 1000,
    createdBy: 'Master Admin',
    createdAt: '2026-10-09'
  },
  {
    id: 'q-b1-3',
    batchId: 'batch-1',
    question: 'In Python, which built-in function returns an iterator that produces tuples containing count and value from an iterable?',
    type: 'text',
    options: ['enumerate()', 'zip()', 'map()', 'filter()'],
    correctIndex: 0,
    timeLimit: 12,
    explanation: 'enumerate(iterable) adds a counter to an iterable and returns it as an enumerate object.',
    category: 'Python & DSA',
    points: 1000,
    createdBy: 'Master Admin',
    createdAt: '2026-10-09'
  },
  {
    id: 'q-b1-4',
    batchId: 'batch-1',
    question: 'What does the term "Overfitting" mean in Machine Learning models?',
    type: 'text',
    options: ['High variance: fits training noise and performs poorly on test data', 'High bias: fails to learn patterns in training data', 'The model trains too quickly on small batch sizes', 'Underestimating feature weights during gradient descent'],
    correctIndex: 0,
    timeLimit: 15,
    explanation: 'Overfitting occurs when a model memorizes training noise rather than general patterns, leading to poor generalization.',
    category: 'AI & ML',
    points: 1000,
    createdBy: 'Master Admin',
    createdAt: '2026-10-09'
  },

  // ================= BATCH 2 / ROUND 2 QUESTIONS =================
  {
    id: 'q-b2-1',
    batchId: 'batch-2',
    question: 'Identify the neural network architecture block shown in this diagram:',
    type: 'image',
    imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"><rect width="400" height="200" fill="%230f172a"/><text x="200" y="30" fill="%2338bdf8" font-size="14" font-weight="bold" font-family="sans-serif" text-anchor="middle">Multi-Head Self Attention Block</text><rect x="50" y="60" width="80" height="50" rx="8" fill="%232563eb"/><text x="90" y="90" fill="%23fff" font-size="12" font-family="sans-serif" text-anchor="middle">Queries (Q)</text><rect x="160" y="60" width="80" height="50" rx="8" fill="%237c3aed"/><text x="200" y="90" fill="%23fff" font-size="12" font-family="sans-serif" text-anchor="middle">Keys (K)</text><rect x="270" y="60" width="80" height="50" rx="8" fill="%23059669"/><text x="310" y="90" fill="%23fff" font-size="12" font-family="sans-serif" text-anchor="middle">Values (V)</text><rect x="110" y="140" width="180" height="40" rx="8" fill="%23ea580c"/><text x="200" y="165" fill="%23fff" font-size="12" font-weight="bold" font-family="sans-serif" text-anchor="middle">Softmax(QK^T / sqrt(d)) * V</text></svg>',
    options: ['Transformer Scaled Dot-Product Attention', 'LeNet Convolutional Layer', 'ResNet Residual Skip Block', 'Recurrent LSTM Memory Cell'],
    correctIndex: 0,
    timeLimit: 20,
    explanation: 'The diagram displays the classic Scaled Dot-Product Multi-Head Attention block with Queries (Q), Keys (K), and Values (V).',
    category: 'AI & ML',
    points: 1000,
    createdBy: 'Master Admin',
    createdAt: '2026-10-09'
  },
  {
    id: 'q-b2-2',
    batchId: 'batch-2',
    question: 'Examine the logic gate circuit diagram below. What is the output function Y?',
    type: 'image',
    imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="180" viewBox="0 0 400 180"><rect width="400" height="180" fill="%230f172a"/><text x="200" y="30" fill="%23f59e0b" font-size="14" font-weight="bold" font-family="sans-serif" text-anchor="middle">Digital Logic Circuit</text><rect x="70" y="60" width="90" height="40" rx="6" fill="%23334155"/><text x="115" y="85" fill="%23fff" font-size="12" font-family="sans-serif" text-anchor="middle">A XOR B</text><rect x="70" y="115" width="90" height="40" rx="6" fill="%23334155"/><text x="115" y="140" fill="%23fff" font-size="12" font-family="sans-serif" text-anchor="middle">A AND B</text><rect x="230" y="85" width="100" height="45" rx="8" fill="%23dc2626"/><text x="280" y="112" fill="%23fff" font-size="12" font-weight="bold" font-family="sans-serif" text-anchor="middle">Half Adder (Y)</text><line x1="160" y1="80" x2="230" y2="100" stroke="%2338bdf8" stroke-width="2"/><line x1="160" y1="135" x2="230" y2="115" stroke="%2338bdf8" stroke-width="2"/></svg>',
    options: ['Half Adder (Sum & Carry)', 'Full Subtractor', '2-to-1 Multiplexer', 'SR Flip Flop'],
    correctIndex: 0,
    timeLimit: 15,
    explanation: 'The circuit combines XOR for the Sum output and AND for the Carry output, which constitutes a Half Adder.',
    category: 'Python & DSA',
    points: 1000,
    createdBy: 'Master Admin',
    createdAt: '2026-10-09'
  },
  {
    id: 'q-b2-3',
    batchId: 'batch-2',
    question: 'In asymmetric cryptography, which mathematical problem forms the foundational security of the RSA cryptosystem?',
    type: 'text',
    options: ['Prime Factorization of large semi-primes', 'Discrete Logarithm on Elliptic Curves', 'Shortest Vector Problem (SVP)', 'Travelling Salesperson NP-hard problem'],
    correctIndex: 0,
    timeLimit: 15,
    explanation: 'RSA relies on the practical difficulty of factoring the product of two large prime numbers.',
    category: 'Cyber Security',
    points: 1000,
    createdBy: 'Master Admin',
    createdAt: '2026-10-09'
  },
  {
    id: 'q-b2-4',
    batchId: 'batch-2',
    question: 'What is the purpose of Dropout regularization in deep neural network training?',
    type: 'text',
    options: ['Randomly zeroes activations during training to prevent co-adaptation', 'Reduces the learning rate exponentially after each epoch', 'Removes dead neurons permanently from the model topology', 'Normalizes batch activations to zero mean and unit variance'],
    correctIndex: 0,
    timeLimit: 15,
    explanation: 'Dropout randomly deactivates a subset of neurons during forward propagation, preventing co-adaptation of features.',
    category: 'AI & ML',
    points: 1000,
    createdBy: 'Master Admin',
    createdAt: '2026-10-09'
  },

  // ================= BATCH 3 / ROUND 3 QUESTIONS =================
  {
    id: 'q-b3-1',
    batchId: 'batch-3',
    question: 'RAPID FIRE: Which residual architecture technique introduced by He et al. (ResNet) solved the vanishing gradient problem in very deep networks?',
    type: 'text',
    options: ['Skip Identity Connections (Residual shortcuts)', 'Layer Normalization with GeLU', 'Long Short-Term Memory Gating', 'Recurrent Backpropagation through Time'],
    correctIndex: 0,
    timeLimit: 10,
    explanation: 'Skip connections allow gradients to flow directly through the identity mapping without attenuation.',
    category: 'AI & ML',
    points: 1200,
    createdBy: 'Master Admin',
    createdAt: '2026-10-09'
  },
  {
    id: 'q-b3-2',
    batchId: 'batch-3',
    question: 'RAPID FIRE: In the A* Search algorithm, what condition must the heuristic function h(n) satisfy to guarantee finding an optimal path?',
    type: 'text',
    options: ['Admissibility (h(n) never overestimates actual cost)', 'Monotonicity with non-positive values', 'Strict linearity across all child nodes', 'Zero variance relative to Dijkstra distance'],
    correctIndex: 0,
    timeLimit: 10,
    explanation: 'An admissible heuristic never overestimates the true remaining cost to the goal, guaranteeing optimality.',
    category: 'AI & ML',
    points: 1200,
    createdBy: 'Master Admin',
    createdAt: '2026-10-09'
  },
  {
    id: 'q-b3-3',
    batchId: 'batch-3',
    question: 'RAPID FIRE: What is the primary difference between Generative AI models and Discriminative models?',
    type: 'text',
    options: ['Generative models learn joint probability P(X,Y); Discriminative learn P(Y|X)', 'Generative models only operate on tabular datasets', 'Discriminative models produce synthetic tokens directly', 'Generative models require supervised labels exclusively'],
    correctIndex: 0,
    timeLimit: 10,
    explanation: 'Generative models model the joint distribution P(X,Y) to generate new samples, while discriminative models model conditional probability P(Y|X).',
    category: 'AI & ML',
    points: 1200,
    createdBy: 'Master Admin',
    createdAt: '2026-10-09'
  }
];

export const INITIAL_PARTICIPANTS: Participant[] = [];
