import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AdminUser,
  MASTER_ADMIN,
  StoredQuestion,
  INITIAL_STORED_QUESTIONS,
  QuizBatch,
  INITIAL_QUIZ_BATCHES,
  Participant,
  INITIAL_PARTICIPANTS,
  DEFAULT_AI_CLUB_LOGO,
  isRealParticipant
} from '../data/adminAccounts';

interface AdminAuthContextType {
  currentAdmin: AdminUser | null;
  isAuthenticated: boolean;
  login: (credential: string, pass: string) => boolean;
  logout: () => void;
  // Quiz Batches / Tournament Rounds
  batches: QuizBatch[];
  activeBatchId: string;
  setActiveBatchId: (id: string) => void;
  addBatch: (b: Omit<QuizBatch, 'id' | 'createdAt'>) => void;
  updateBatch: (id: string, updatedFields: Partial<QuizBatch>) => void;
  deleteBatch: (id: string) => void;
  publishBatch: (id: string, isPublished: boolean) => void;
  getQuestionsForBatch: (batchId: string) => StoredQuestion[];
  // Questions Database
  questions: StoredQuestion[];
  addQuestion: (q: Omit<StoredQuestion, 'id' | 'createdAt' | 'createdBy'>) => void;
  updateQuestion: (id: string, updatedFields: Partial<StoredQuestion>) => void;
  deleteQuestion: (id: string) => void;
  resetQuestions: () => void;
  // Participants Database
  participants: Participant[];
  addParticipant: (p: Omit<Participant, 'id' | 'joinedAt'>) => void;
  updateParticipant: (id: string, updatedFields: Partial<Participant>) => void;
  deleteParticipant: (id: string) => void;
  resetParticipantScores: () => void;
  clearAllParticipants: () => void;
  // Logo & Branding
  clubLogo: string;
  updateClubLogo: (logo: string) => void;
  resetClubLogo: () => void;
  // Event & Room Controls
  eventName: string;
  venue: string;
  roomPin: string;
  generateNewRoomPin: () => string;
  updateEventSettings: (name: string, venueStr: string, pinStr: string) => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const ADMIN_STORAGE_KEY = 'cmrtc_master_admin';
const BATCHES_STORAGE_KEY = 'cmrtc_quiz_batches_v3';
const ACTIVE_BATCH_KEY = 'cmrtc_active_batch_id';
const QUESTIONS_STORAGE_KEY = 'cmrtc_stored_questions_v3';
const PARTICIPANTS_STORAGE_KEY = 'cmrtc_stored_participants_v2';
const LOGO_STORAGE_KEY = 'cmrtc_ai_club_logo';
const EVENT_STORAGE_KEY = 'cmrtc_event_settings';

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Admin Auth
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem(ADMIN_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // 2. Quiz Batches / Rounds
  const [batches, setBatches] = useState<QuizBatch[]>(() => {
    try {
      const saved = localStorage.getItem(BATCHES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_QUIZ_BATCHES;
    } catch {
      return INITIAL_QUIZ_BATCHES;
    }
  });

  const [activeBatchId, setActiveBatchId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_BATCH_KEY);
      return saved || 'batch-1';
    } catch {
      return 'batch-1';
    }
  });

  // 3. Questions Database
  const [questions, setQuestions] = useState<StoredQuestion[]>(() => {
    try {
      const saved = localStorage.getItem(QUESTIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure legacy questions have a batchId
        return parsed.map((q: any) => ({
          ...q,
          batchId: q.batchId || 'batch-1'
        }));
      }
      return INITIAL_STORED_QUESTIONS;
    } catch {
      return INITIAL_STORED_QUESTIONS;
    }
  });

  // 4. Participants Database (Strictly real participants who joined the quiz)
  const [participants, setParticipants] = useState<Participant[]>(() => {
    try {
      const saved = localStorage.getItem(PARTICIPANTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(isRealParticipant);
          localStorage.setItem(PARTICIPANTS_STORAGE_KEY, JSON.stringify(cleaned));
          return cleaned;
        }
      }
    } catch {}
    return [];
  });

  // 5. AI Club Logo
  const [clubLogo, setClubLogo] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(LOGO_STORAGE_KEY);
      if (!saved || saved.startsWith('data:image/svg+xml')) {
        return DEFAULT_AI_CLUB_LOGO;
      }
      return saved;
    } catch {
      return DEFAULT_AI_CLUB_LOGO;
    }
  });

  // Helper to generate a unique random 6-digit room PIN on every session
  const generateUniquePin = (): string => {
    const pinNum = Math.floor(100000 + Math.random() * 900000);
    return `${pinNum.toString().slice(0, 3)} ${pinNum.toString().slice(3)}`;
  };

  // 6. Event Settings
  const [eventName, setEventName] = useState<string>('Battle of Bits \'26');
  const [venue, setVenue] = useState<string>('CMRTC B-Block room no. 119');
  const [roomPin, setRoomPin] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('cmrtc_host_room_pin');
      if (saved && saved.trim()) return saved;
    } catch {}
    return '107 287';
  });

  const generateNewRoomPin = (): string => {
    const newPin = generateUniquePin();
    setRoomPin(newPin);
    try {
      localStorage.setItem('cmrtc_host_room_pin', newPin);
    } catch {}
    return newPin;
  };

  useEffect(() => {
    try {
      localStorage.setItem('cmrtc_host_room_pin', roomPin);
    } catch {}
  }, [roomPin]);

  // Persistence Effects
  useEffect(() => {
    if (currentAdmin) {
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(currentAdmin));
    } else {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
    }
  }, [currentAdmin]);

  useEffect(() => {
    localStorage.setItem(BATCHES_STORAGE_KEY, JSON.stringify(batches));
  }, [batches]);

  useEffect(() => {
    localStorage.setItem(ACTIVE_BATCH_KEY, activeBatchId);
  }, [activeBatchId]);

  useEffect(() => {
    localStorage.setItem(QUESTIONS_STORAGE_KEY, JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem(PARTICIPANTS_STORAGE_KEY, JSON.stringify(participants));
  }, [participants]);

  useEffect(() => {
    localStorage.setItem(LOGO_STORAGE_KEY, clubLogo);
  }, [clubLogo]);

  // Synchronize participants joined from /play across browser tabs in real-time
  useEffect(() => {
    const syncParticipants = () => {
      try {
        const saved = localStorage.getItem(PARTICIPANTS_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.filter(isRealParticipant);
            setParticipants(cleaned);
          }
        } else {
          setParticipants([]);
        }
      } catch {}
    };

    window.addEventListener('storage', syncParticipants);
    const interval = setInterval(syncParticipants, 1500);

    return () => {
      window.removeEventListener('storage', syncParticipants);
      clearInterval(interval);
    };
  }, []);

  // Auth Methods
  const login = (credential: string, pass: string): boolean => {
    const credLower = credential.trim().toLowerCase();
    const isUserMatch = credLower === MASTER_ADMIN.username.toLowerCase() || credLower === MASTER_ADMIN.email.toLowerCase();
    const isPassMatch = pass.trim() === MASTER_ADMIN.passwordHash;

    if (isUserMatch && isPassMatch) {
      setCurrentAdmin(MASTER_ADMIN);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentAdmin(null);
  };

  // Batch Methods
  const addBatch = (newB: Omit<QuizBatch, 'id' | 'createdAt'>) => {
    const created: QuizBatch = {
      ...newB,
      id: `batch-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setBatches((prev) => [...prev, created]);
    setActiveBatchId(created.id);
  };

  const updateBatch = (id: string, updatedFields: Partial<QuizBatch>) => {
    setBatches((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updatedFields } : b))
    );
  };

  const deleteBatch = (id: string) => {
    if (batches.length <= 1) {
      alert('Cannot delete the last remaining round batch.');
      return;
    }
    setBatches((prev) => prev.filter((b) => b.id !== id));
    // Reassign questions to the first available batch
    const fallbackId = batches.find((b) => b.id !== id)?.id || 'batch-1';
    setQuestions((prev) =>
      prev.map((q) => (q.batchId === id ? { ...q, batchId: fallbackId } : q))
    );
    if (activeBatchId === id) {
      setActiveBatchId(fallbackId);
    }
  };

  const publishBatch = (id: string, isPublished: boolean) => {
    setBatches((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isPublished } : b))
    );
  };

  const getQuestionsForBatch = (batchId: string): StoredQuestion[] => {
    return questions.filter((q) => q.batchId === batchId);
  };

  // Questions Database Methods
  const addQuestion = (newQ: Omit<StoredQuestion, 'id' | 'createdAt' | 'createdBy'>) => {
    const created: StoredQuestion = {
      ...newQ,
      id: `q-${Date.now()}`,
      batchId: newQ.batchId || activeBatchId,
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: 'Master Admin'
    };
    setQuestions((prev) => [created, ...prev]);
  };

  const updateQuestion = (id: string, updatedFields: Partial<StoredQuestion>) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...updatedFields } : q))
    );
  };

  const deleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const resetQuestions = () => {
    setQuestions(INITIAL_STORED_QUESTIONS);
    setBatches(INITIAL_QUIZ_BATCHES);
    setActiveBatchId('batch-1');
  };

  // Participants Database Methods
  const addParticipant = (newP: Omit<Participant, 'id' | 'joinedAt'>) => {
    const created: Participant = {
      ...newP,
      id: `p-${Date.now()}`,
      joinedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setParticipants((prev) => [created, ...prev]);
  };

  const updateParticipant = (id: string, updatedFields: Partial<Participant>) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p))
    );
  };

  const deleteParticipant = (id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  };

  const resetParticipantScores = () => {
    setParticipants((prev) =>
      prev.map((p) => ({ ...p, score: 0, streak: 0, accuracy: '0%' }))
    );
  };

  const clearAllParticipants = () => {
    setParticipants([]);
    localStorage.removeItem(PARTICIPANTS_STORAGE_KEY);
    localStorage.removeItem('cmrtc_live_lobby_players');
    localStorage.removeItem('cmrtc_live_tournament_scores');
    window.dispatchEvent(new Event('storage'));
  };

  // Logo Methods
  const updateClubLogo = (logo: string) => {
    setClubLogo(logo);
  };

  const resetClubLogo = () => {
    setClubLogo(DEFAULT_AI_CLUB_LOGO);
  };

  // Event Settings
  const updateEventSettings = (name: string, venueStr: string, pinStr: string) => {
    setEventName(name);
    setVenue(venueStr);
    setRoomPin(pinStr);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        currentAdmin,
        isAuthenticated: !!currentAdmin,
        login,
        logout,
        batches,
        activeBatchId,
        setActiveBatchId,
        addBatch,
        updateBatch,
        deleteBatch,
        publishBatch,
        getQuestionsForBatch,
        questions,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        resetQuestions,
        participants,
        addParticipant,
        updateParticipant,
        deleteParticipant,
        resetParticipantScores,
        clearAllParticipants,
        clubLogo,
        updateClubLogo,
        resetClubLogo,
        eventName,
        venue,
        roomPin,
        generateNewRoomPin,
        updateEventSettings
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
