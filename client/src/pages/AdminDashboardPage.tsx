import React, { useState, useRef } from 'react';
import { useLocation, Link } from 'wouter';
import {
  ShieldCheck,
  Plus,
  Image as ImageIcon,
  FileText,
  Trash2,
  Edit3,
  Tv,
  Download,
  Upload,
  CheckCircle2,
  Sparkles,
  LogOut,
  Search,
  Users,
  Settings,
  Eye,
  X,
  Clock,
  RotateCcw,
  UserPlus,
  Flame,
  Award,
  Palette,
  Layers,
  Lock,
  Unlock,
  FolderPlus,
  ChevronRight
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { StoredQuestion, Participant, QuizBatch } from '../data/adminAccounts';
import { CHOICE_ICONS, CHOICE_COLORS } from '../data/quizData';
import { sounds } from '../utils/soundEngine';

export const AdminDashboardPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const {
    currentAdmin,
    isAuthenticated,
    logout,
    // Batches Database
    batches,
    activeBatchId,
    setActiveBatchId,
    addBatch,
    updateBatch,
    deleteBatch,
    publishBatch,
    getQuestionsForBatch,
    // Questions Database
    questions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    resetQuestions,
    // Participants Database
    participants,
    addParticipant,
    updateParticipant,
    deleteParticipant,
    resetParticipantScores,
    clearAllParticipants,
    // Logo & Branding
    clubLogo,
    updateClubLogo,
    resetClubLogo,
    // Event Settings
    eventName,
    venue,
    roomPin,
    updateEventSettings
  } = useAdminAuth();

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/admin/login');
    }
  }, [isAuthenticated, setLocation]);

  // Main Tabs: 'questions' | 'participants' | 'branding' | 'event'
  const [activeTab, setActiveTab] = useState<'questions' | 'participants' | 'branding' | 'event'>('questions');

  // Batch Filter in Questions Tab
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<string>('all');

  // Batch Modal States
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [editingBatchId, setEditingBatchId] = useState<string | null>(null);
  const [bName, setBName] = useState('');
  const [bDesc, setBDesc] = useState('');
  const [bRoundNum, setBRoundNum] = useState<number>(1);
  const [bPublished, setBPublished] = useState<boolean>(false);

  // Question Modal States
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'text' | 'image'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewImageModal, setPreviewImageModal] = useState<string | null>(null);

  // Question Form Fields
  const [qBatchId, setQBatchId] = useState<string>(activeBatchId || 'batch-1');
  const [qType, setQType] = useState<'text' | 'image'>('text');
  const [qText, setQText] = useState('');
  const [qImage, setQImage] = useState<string>('');
  const [qCategory, setQCategory] = useState<StoredQuestion['category']>('AI & ML');
  const [qTimeLimit, setQTimeLimit] = useState<number>(15);
  const [qPoints, setQPoints] = useState<number>(1000);
  const [qOptions, setQOptions] = useState<string[]>(['', '', '', '']);
  const [qCorrectIndex, setQCorrectIndex] = useState<number>(0);
  const [qExplanation, setQExplanation] = useState<string>('');

  // Participant Modal States
  const [showParticipantModal, setShowParticipantModal] = useState(false);
  const [editingParticipantId, setEditingParticipantId] = useState<string | null>(null);
  const [pName, setPName] = useState('');
  const [pBranch, setPBranch] = useState('CSE (AI & ML)');
  const [pYear, setPYear] = useState('3rd Year');
  const [pScore, setPScore] = useState<number>(0);
  const [pStreak, setPStreak] = useState<number>(0);
  const [pAvatar, setPAvatar] = useState('⚡');
  const [pSearch, setPSearch] = useState('');

  // Event Settings Temp State
  const [tempEventName, setTempEventName] = useState(eventName);
  const [tempVenue, setTempVenue] = useState(venue);
  const [tempPin, setTempPin] = useState(roomPin);

  const questionImageInputRef = useRef<HTMLInputElement | null>(null);
  const logoImageInputRef = useRef<HTMLInputElement | null>(null);

  if (!currentAdmin) return null;

  // ================= BATCHES ACTIONS =================
  const openAddBatch = () => {
    sounds.playPop();
    setEditingBatchId(null);
    setBName(`Round ${batches.length + 1}: Final Round`);
    setBDesc('Tournament round with custom questions.');
    setBRoundNum(batches.length + 1);
    setBPublished(false);
    setShowBatchModal(true);
  };

  const openEditBatch = (batch: QuizBatch) => {
    sounds.playPop();
    setEditingBatchId(batch.id);
    setBName(batch.name);
    setBDesc(batch.description);
    setBRoundNum(batch.roundNumber);
    setBPublished(batch.isPublished);
    setShowBatchModal(true);
  };

  const handleBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bName.trim()) return;

    if (editingBatchId) {
      updateBatch(editingBatchId, {
        name: bName.trim(),
        description: bDesc.trim(),
        roundNumber: Number(bRoundNum) || 1,
        isPublished: bPublished
      });
    } else {
      addBatch({
        name: bName.trim(),
        description: bDesc.trim(),
        roundNumber: Number(bRoundNum) || 1,
        isPublished: bPublished
      });
    }

    sounds.playCorrect();
    setShowBatchModal(false);
  };

  // ================= QUESTIONS ACTIONS =================
  const openAddQuestion = () => {
    sounds.playPop();
    setEditingQuestionId(null);
    setQBatchId(selectedBatchFilter !== 'all' ? selectedBatchFilter : activeBatchId);
    setQType('text');
    setQText('');
    setQImage('');
    setQCategory('AI & ML');
    setQTimeLimit(15);
    setQPoints(1000);
    setQOptions(['', '', '', '']);
    setQCorrectIndex(0);
    setQExplanation('');
    setShowQuestionModal(true);
  };

  const openEditQuestion = (q: StoredQuestion) => {
    sounds.playPop();
    setEditingQuestionId(q.id);
    setQBatchId(q.batchId || activeBatchId);
    setQType(q.type);
    setQText(q.question);
    setQImage(q.imageUrl || '');
    setQCategory(q.category);
    setQTimeLimit(q.timeLimit);
    setQPoints(q.points);
    setQOptions([...q.options]);
    setQCorrectIndex(q.correctIndex);
    setQExplanation(q.explanation);
    setShowQuestionModal(true);
  };

  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText.trim()) return;
    if (qOptions.some((opt) => !opt.trim())) {
      alert('Please fill in all 4 answer options.');
      return;
    }
    if (qType === 'image' && !qImage) {
      alert('Please upload an image or provide an image link.');
      return;
    }

    if (editingQuestionId) {
      updateQuestion(editingQuestionId, {
        question: qText.trim(),
        batchId: qBatchId,
        type: qType,
        imageUrl: qType === 'image' ? qImage : undefined,
        category: qCategory,
        timeLimit: Number(qTimeLimit) || 15,
        points: Number(qPoints) || 1000,
        options: qOptions.map((o) => o.trim()),
        correctIndex: qCorrectIndex,
        explanation: qExplanation.trim() || 'Verified answer by AI CLUB CMRTC.'
      });
    } else {
      addQuestion({
        question: qText.trim(),
        batchId: qBatchId,
        type: qType,
        imageUrl: qType === 'image' ? qImage : undefined,
        category: qCategory,
        timeLimit: Number(qTimeLimit) || 15,
        points: Number(qPoints) || 1000,
        options: qOptions.map((o) => o.trim()),
        correctIndex: qCorrectIndex,
        explanation: qExplanation.trim() || 'Verified answer by AI CLUB CMRTC.'
      });
    }

    sounds.playCorrect();
    setShowQuestionModal(false);
  };

  const handleQuestionImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setQImage(reader.result);
          sounds.playPop();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // ================= PARTICIPANTS ACTIONS =================
  const openAddParticipant = () => {
    sounds.playPop();
    setEditingParticipantId(null);
    setPName('');
    setPBranch('CSE (AI & ML)');
    setPYear('3rd Year');
    setPScore(0);
    setPStreak(0);
    setPAvatar('⚡');
    setShowParticipantModal(true);
  };

  const openEditParticipant = (p: Participant) => {
    sounds.playPop();
    setEditingParticipantId(p.id);
    setPName(p.name);
    setPBranch(p.branch);
    setPYear(p.year);
    setPScore(p.score);
    setPStreak(p.streak);
    setPAvatar(p.avatar);
    setShowParticipantModal(true);
  };

  const handleParticipantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim()) return;

    if (editingParticipantId) {
      updateParticipant(editingParticipantId, {
        name: pName.trim(),
        branch: pBranch,
        year: pYear,
        score: Number(pScore) || 0,
        streak: Number(pStreak) || 0,
        avatar: pAvatar
      });
    } else {
      addParticipant({
        name: pName.trim(),
        branch: pBranch,
        year: pYear,
        score: Number(pScore) || 0,
        streak: Number(pStreak) || 0,
        accuracy: '100%',
        avatar: pAvatar
      });
    }

    sounds.playCorrect();
    setShowParticipantModal(false);
  };

  // ================= LOGO UPLOAD ACTIONS =================
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          updateClubLogo(reader.result);
          sounds.playCorrect();
          alert('AI CLUB CMRTC Logo updated successfully across the entire site!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // ================= EVENT SETTINGS SAVE =================
  const handleSaveEventSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateEventSettings(tempEventName, tempVenue, tempPin);
    sounds.playCorrect();
    alert('Event settings updated successfully!');
  };

  // Export JSON
  const handleExportQuestions = () => {
    sounds.playPop();
    const exportData = {
      batches,
      questions,
      exportedAt: new Date().toISOString()
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const dl = document.createElement('a');
    dl.setAttribute('href', dataStr);
    dl.setAttribute('download', `cmrtc-quiz-batches-export-${Date.now()}.json`);
    document.body.appendChild(dl);
    dl.click();
    dl.remove();
  };

  // Filtering questions by selected batch, type, and search query
  const filteredQuestions = questions.filter((q) => {
    const matchesBatch = selectedBatchFilter === 'all' || q.batchId === selectedBatchFilter;
    const matchesType = filterType === 'all' || q.type === filterType;
    const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          q.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBatch && matchesType && matchesSearch;
  });

  const filteredParticipants = participants.filter((p) =>
    p.name.toLowerCase().includes(pSearch.toLowerCase()) ||
    p.branch.toLowerCase().includes(pSearch.toLowerCase())
  );

  const activeBatchObj = batches.find((b) => b.id === (selectedBatchFilter !== 'all' ? selectedBatchFilter : activeBatchId)) || batches[0];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 sm:py-10 space-y-8">
      
      {/* Master Admin Header Bar */}
      <div className="card p-5 sm:p-6 bg-white/95 border border-blue-100 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl overflow-hidden p-1 bg-blue-50 border border-blue-200 shadow-sm flex items-center justify-center shrink-0">
            <img src={clubLogo} alt="AI Club Logo" className="w-full h-full object-contain rounded-xl" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-extrabold text-xl text-slate-900">
                {currentAdmin.name}
              </h1>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-200">
                MASTER SUPER ADMIN
              </span>
            </div>
            <div className="text-xs text-slate-500">
              {currentAdmin.email} • Multi-Round Batches • Question Confidentiality • Live Projector Control
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/host"
            className="btn-primary px-4 py-2.5 text-xs sm:text-sm flex items-center gap-1.5 shadow-sm font-bold"
            onClick={() => sounds.playPop()}
          >
            <Tv className="w-4 h-4" />
            Launch Host Projector
          </Link>
          <button
            onClick={() => {
              sounds.playPop();
              logout();
            }}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Feature Tabs */}
      <div className="flex items-center gap-2 border-b border-blue-100 pb-3 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => { sounds.playPop(); setActiveTab('questions'); }}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'questions'
              ? 'bg-blue-600 text-white shadow-sm font-bold'
              : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50 bg-white border border-blue-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          Round Batches & Questions ({questions.length})
        </button>

        <button
          onClick={() => { sounds.playPop(); setActiveTab('participants'); }}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'participants'
              ? 'bg-blue-600 text-white shadow-sm font-bold'
              : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50 bg-white border border-blue-100'
          }`}
        >
          <Users className="w-4 h-4" />
          Participants Database ({participants.length})
        </button>

        <button
          onClick={() => { sounds.playPop(); setActiveTab('branding'); }}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'branding'
              ? 'bg-blue-600 text-white shadow-sm font-bold'
              : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50 bg-white border border-blue-100'
          }`}
        >
          <Palette className="w-4 h-4" />
          AI Club Logo & Branding
        </button>

        <button
          onClick={() => { sounds.playPop(); setActiveTab('event'); }}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'event'
              ? 'bg-blue-600 text-white shadow-sm font-bold'
              : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50 bg-white border border-blue-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          Event Settings & Venue
        </button>
      </div>

      {/* ================= TAB 1: ROUND BATCHES & QUESTIONS ================= */}
      {activeTab === 'questions' && (
        <div className="space-y-6">

          {/* Round Batches Bar */}
          <div className="card p-4 bg-white border border-blue-100 rounded-3xl shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs flex-wrap gap-2">
              <span className="font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                Tournament Round Batches ({batches.length} Rounds)
              </span>
              <button
                onClick={openAddBatch}
                className="btn-secondary px-3 py-1.5 text-xs text-blue-700 flex items-center gap-1 font-bold"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                + Create New Round Batch
              </button>
            </div>

            {/* Batch Navigation Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
              <button
                onClick={() => {
                  sounds.playPop();
                  setSelectedBatchFilter('all');
                }}
                className={`px-3.5 py-2 rounded-xl shrink-0 font-bold transition-all ${
                  selectedBatchFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                All Rounds ({questions.length})
              </button>

              {batches.map((b) => {
                const count = getQuestionsForBatch(b.id).length;
                const isSelected = selectedBatchFilter === b.id;
                const isProjectorActive = activeBatchId === b.id;

                return (
                  <button
                    key={b.id}
                    onClick={() => {
                      sounds.playPop();
                      setSelectedBatchFilter(b.id);
                    }}
                    className={`px-3.5 py-2 rounded-xl shrink-0 font-bold transition-all flex items-center gap-2 border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-slate-700 border-blue-100 hover:bg-blue-50 hover:border-blue-200'
                    }`}
                  >
                    <span>{b.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected ? 'bg-blue-700 text-white' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {count} Qs
                    </span>
                    {b.isPublished ? (
                      <span className="text-[10px] text-emerald-400 font-bold">● Published</span>
                    ) : (
                      <span className="text-[10px] text-amber-400 font-bold">🔒 Confidential</span>
                    )}
                    {isProjectorActive && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-extrabold uppercase">
                        Projector
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Batch Details & Control Strip */}
            {selectedBatchFilter !== 'all' && activeBatchObj && (
              <div className="mt-2 p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/80 via-sky-50 to-indigo-50/60 border border-blue-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm">{activeBatchObj.name}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600 font-medium">Round {activeBatchObj.roundNumber}</span>
                    <span className="text-slate-400">•</span>
                    <span className="font-bold text-blue-700 font-mono">{getQuestionsForBatch(activeBatchObj.id).length} Questions</span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">{activeBatchObj.description}</p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Publish Toggle Button */}
                  <button
                    onClick={() => {
                      sounds.playPop();
                      publishBatch(activeBatchObj.id, !activeBatchObj.isPublished);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 text-xs transition-all ${
                      activeBatchObj.isPublished
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300'
                    }`}
                    title={activeBatchObj.isPublished ? 'Round is published and ready to host' : 'Round is confidential; hidden until launched'}
                  >
                    {activeBatchObj.isPublished ? (
                      <>
                        <Unlock className="w-3.5 h-3.5" />
                        ✓ Published (Visible on Projector)
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        🔒 Confidential (Admin Only)
                      </>
                    )}
                  </button>

                  {/* Set Active for Projector */}
                  <button
                    onClick={() => {
                      sounds.playPop();
                      setActiveBatchId(activeBatchObj.id);
                      alert(`Set "${activeBatchObj.name}" as the active tournament round for the Auditorium Projector!`);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all ${
                      activeBatchId === activeBatchObj.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white border border-blue-200 text-blue-700 hover:bg-blue-50'
                    }`}
                  >
                    <Tv className="w-3.5 h-3.5" />
                    {activeBatchId === activeBatchObj.id ? 'Active on Projector' : 'Set for Projector'}
                  </button>

                  <button
                    onClick={() => openEditBatch(activeBatchObj)}
                    className="p-1.5 rounded-xl bg-white border border-blue-200 text-slate-600 hover:text-blue-700 hover:bg-blue-50"
                    title="Edit Batch Info"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      sounds.playPop();
                      if (confirm(`Delete batch "${activeBatchObj.name}"? Questions will be reassigned to another batch.`)) {
                        deleteBatch(activeBatchObj.id);
                      }
                    }}
                    className="p-1.5 rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50"
                    title="Delete Batch"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Controls Bar for Questions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-blue-100 shadow-sm">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                  filterType === 'all'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                All Formats ({filteredQuestions.length})
              </button>
              <button
                onClick={() => setFilterType('text')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
                  filterType === 'text'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Text ({filteredQuestions.filter(q => q.type === 'text').length})
              </button>
              <button
                onClick={() => setFilterType('image')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
                  filterType === 'image'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                Image ({filteredQuestions.filter(q => q.type === 'image').length})
              </button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search questions or timers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-blue-100 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-400"
                />
              </div>

              <button
                onClick={openAddQuestion}
                className="btn-primary px-3.5 py-1.5 text-xs flex items-center gap-1 shrink-0 font-bold"
              >
                <Plus className="w-4 h-4" />
                Add Question
              </button>

              <button
                onClick={handleExportQuestions}
                className="btn-secondary px-3 py-1.5 text-xs flex items-center gap-1 shrink-0"
                title="Export Batches & Questions JSON"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
            </div>
          </div>

          {/* Questions Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {filteredQuestions.map((q) => {
              const questionBatch = batches.find((b) => b.id === q.batchId);
              return (
                <div
                  key={q.id}
                  className="card p-5 bg-white border border-blue-100 flex flex-col justify-between gap-4 shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        {/* Batch Badge */}
                        <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold text-[10px] border border-blue-200">
                          {questionBatch ? questionBatch.name : 'Unassigned Batch'}
                        </span>

                        {q.type === 'image' ? (
                          <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold border border-purple-200 flex items-center gap-1 text-[10px]">
                            <ImageIcon className="w-3 h-3" />
                            Image Question
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold border border-blue-200 flex items-center gap-1 text-[10px]">
                            <FileText className="w-3 h-3" />
                            Text MCQ
                          </span>
                        )}
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500 font-semibold text-[11px]">{q.category}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Timer Display */}
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-mono font-bold text-[11px] border border-amber-200 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" />
                          {q.timeLimit}s
                        </span>

                        {/* Edit Button */}
                        <button
                          onClick={() => openEditQuestion(q)}
                          className="p-1 rounded-md text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit Question & Timer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => {
                            sounds.playPop();
                            if (confirm(`Delete this question from database?`)) {
                              deleteQuestion(q.id);
                            }
                          }}
                          className="p-1 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Question"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Image Thumbnail */}
                    {q.type === 'image' && q.imageUrl && (
                      <div
                        onClick={() => setPreviewImageModal(q.imageUrl!)}
                        className="relative group rounded-xl overflow-hidden border border-blue-100 bg-slate-50 p-2 cursor-pointer max-h-40 flex items-center justify-center"
                      >
                        <img src={q.imageUrl} alt="Diagram" className="max-h-36 w-auto object-contain rounded-lg group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-blue-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold gap-1 transition-opacity">
                          <Eye className="w-4 h-4" />
                          Enlarge Image
                        </div>
                      </div>
                    )}

                    {/* Question Text */}
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                      {q.question}
                    </h3>

                    {/* 4 Choices */}
                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      {q.options.map((opt, idx) => {
                        const isCorrect = idx === q.correctIndex;
                        return (
                          <div
                            key={idx}
                            className={`p-2 rounded-lg flex items-center gap-1.5 truncate ${
                              isCorrect
                                ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-300'
                                : 'bg-slate-50 text-slate-600 border border-slate-200'
                            }`}
                          >
                            <span className="font-bold text-[10px]">{CHOICE_ICONS[idx]}</span>
                            <span className="truncate">{opt}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-blue-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Custom Timer: <strong className="text-amber-700 font-mono">{q.timeLimit} seconds</strong></span>
                    <button
                      onClick={() => openEditQuestion(q)}
                      className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      Edit Details →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 2: PARTICIPANTS DATABASE ================= */}
      {activeTab === 'participants' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-blue-100 shadow-sm">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search participant by name or branch..."
                value={pSearch}
                onChange={(e) => setPSearch(e.target.value)}
                className="w-full bg-slate-50 border border-blue-100 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={openAddParticipant}
                className="btn-primary px-3.5 py-1.5 text-xs flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Add Student
              </button>
              <button
                onClick={() => {
                  sounds.playPop();
                  if (confirm('Reset all participant scores to 0 for a new tournament?')) {
                    resetParticipantScores();
                  }
                }}
                className="btn-secondary px-3 py-1.5 text-xs flex items-center gap-1 text-amber-700 hover:text-amber-800"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Scores
              </button>
              <button
                onClick={() => {
                  sounds.playPop();
                  if (confirm('Are you sure you want to completely clear all participants from the database? This will remove all joined players for a fresh start.')) {
                    clearAllParticipants();
                  }
                }}
                className="btn-secondary px-3 py-1.5 text-xs flex items-center gap-1 text-rose-700 hover:text-rose-800 border-rose-200 hover:bg-rose-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All
              </button>
            </div>
          </div>

          {/* Editable Participants Table */}
          <div className="card overflow-hidden bg-white border border-blue-100 shadow-sm rounded-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-blue-50/70 text-slate-700 font-semibold border-b border-blue-100">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Department & Year</th>
                    <th className="py-3 px-4">Score (pts)</th>
                    <th className="py-3 px-4">Streak</th>
                    <th className="py-3 px-4">Joined</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-50 text-slate-700">
                  {filteredParticipants.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Users className="w-8 h-8 text-slate-300" />
                          <p className="text-sm font-bold text-slate-700">No participants registered in database</p>
                          <p className="text-xs text-slate-400 max-w-sm">
                            Real participants will automatically appear here as students enter Room PIN <span className="font-mono font-bold text-blue-600">{roomPin}</span> and their nickname at /play.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredParticipants.map((p) => (
                      <tr key={p.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                          <span className="text-base">{p.avatar}</span>
                          <span>{p.name}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {p.branch} • {p.year}
                        </td>
                        <td className="py-3 px-4 font-mono font-extrabold text-blue-600 text-sm">
                          {p.score}
                        </td>
                        <td className="py-3 px-4 font-mono text-amber-600 font-bold">
                          🔥 {p.streak}x
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                          {p.joinedAt}
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => openEditParticipant(p)}
                            className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] border border-blue-200 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              sounds.playPop();
                              if (confirm(`Remove ${p.name} from the event roster?`)) {
                                deleteParticipant(p.id);
                              }
                            }}
                            className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-[11px] border border-rose-200 transition-colors"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: AI CLUB LOGO & BRANDING STUDIO ================= */}
      {activeTab === 'branding' && (
        <div className="card p-6 sm:p-8 bg-white border border-blue-100 rounded-3xl shadow-sm space-y-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Palette className="w-5 h-5 text-blue-600" />
              AI CLUB CMRTC Logo & Branding
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Upload your official AI Club logo. It immediately updates on the navigation bar, host screen, student gameplay, and certificates!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            {/* Live Logo Preview Card */}
            <div className="p-6 rounded-2xl bg-blue-50/50 border border-blue-200 text-center space-y-3">
              <div className="text-xs text-slate-600 font-semibold uppercase">Current Active Logo</div>
              <div className="w-32 h-32 mx-auto rounded-full p-1 bg-white border-2 border-blue-400 shadow-md ring-4 ring-blue-100 flex items-center justify-center overflow-hidden">
                <img src={clubLogo} alt="AI Club Logo" className="w-full h-full object-cover rounded-full" />
              </div>
              <div className="text-[11px] text-emerald-700 font-mono font-bold">● Active Site-Wide</div>
            </div>

            {/* Upload Controls */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Upload Club Logo from Computer
                </label>
                <input
                  type="file"
                  accept="image/*"
                  ref={logoImageInputRef}
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => logoImageInputRef.current?.click()}
                  className="btn-primary w-full py-3 text-xs flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Select & Upload Image (.PNG, .JPG, .SVG)
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Or Paste Logo Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://..."
                    value={clubLogo.startsWith('data:') ? '' : clubLogo}
                    onChange={(e) => updateClubLogo(e.target.value)}
                    className="flex-1 bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={() => {
                      sounds.playCorrect();
                      alert('Logo URL saved!');
                    }}
                    className="btn-secondary px-3 py-2 text-xs"
                  >
                    Apply
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    sounds.playPop();
                    resetClubLogo();
                  }}
                  className="text-xs text-slate-500 hover:text-blue-700 underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset to Default AI Club Logo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: EVENT & ROOM SETTINGS ================= */}
      {activeTab === 'event' && (
        <form onSubmit={handleSaveEventSettings} className="card p-6 sm:p-8 bg-white border border-blue-100 rounded-3xl shadow-sm space-y-5 max-w-xl">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              Live Tournament & Venue Settings
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Configure event title, room PIN, and the official campus venue.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Event Title
            </label>
            <input
              type="text"
              required
              value={tempEventName}
              onChange={(e) => setTempEventName(e.target.value)}
              className="w-full bg-slate-50 border border-blue-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Official Venue
            </label>
            <input
              type="text"
              required
              value={tempVenue}
              onChange={(e) => setTempVenue(e.target.value)}
              className="w-full bg-slate-50 border border-blue-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Auditorium Room PIN
            </label>
            <input
              type="text"
              required
              value={tempPin}
              onChange={(e) => setTempPin(e.target.value)}
              className="w-full bg-blue-50/60 border border-blue-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-blue-700 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full py-2.5 text-xs flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Update Event Configuration
          </button>
        </form>
      )}

      {/* ================= BATCH ADD / EDIT MODAL ================= */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-blue-200 rounded-3xl p-6 sm:p-7 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-blue-100 pb-2">
              <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-blue-600" />
                {editingBatchId ? 'Edit Tournament Round' : 'Create New Tournament Round'}
              </h2>
              <button onClick={() => setShowBatchModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleBatchSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Round Batch Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Round 4: Rapid Fire Tie-Breaker"
                  value={bName}
                  onChange={(e) => setBName(e.target.value)}
                  className="w-full bg-slate-50 border border-blue-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Round Sequence Number
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={20}
                  value={bRoundNum}
                  onChange={(e) => setBRoundNum(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-blue-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Description / Topic Focus
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe this round's syllabus or rules..."
                  value={bDesc}
                  onChange={(e) => setBDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-blue-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                />
              </div>

              <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Publish Status</div>
                  <div className="text-[11px] text-slate-500">
                    {bPublished ? 'Published: Ready for Auditorium Projector' : 'Confidential: Hidden until you publish'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setBPublished(!bPublished)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs ${
                    bPublished
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {bPublished ? '✓ Published' : '🔒 Confidential'}
                </button>
              </div>

              <button type="submit" className="btn-primary w-full py-2.5 text-xs mt-2 font-bold">
                {editingBatchId ? 'Save Round Changes' : 'Create Round Batch'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= QUESTION ADD / EDIT MODAL ================= */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white border border-blue-200 rounded-3xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-blue-100 pb-3">
              <div>
                <h2 className="font-display text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-blue-600" />
                  {editingQuestionId ? 'Edit Question & Custom Timer' : 'Add New Question'}
                </h2>
                <div className="text-xs text-slate-500">
                  Authorized Administrator: <strong className="text-slate-800">Master Admin</strong>
                </div>
              </div>
              <button
                onClick={() => setShowQuestionModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuestionSubmit} className="space-y-4 text-xs">
              
              {/* Batch Assignment Dropdown */}
              <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1">
                <label className="block font-bold text-blue-900 uppercase tracking-wider text-[11px]">
                  Assign Question to Tournament Round Batch
                </label>
                <select
                  value={qBatchId}
                  onChange={(e) => setQBatchId(e.target.value)}
                  className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs font-bold text-blue-700 focus:outline-none focus:border-blue-500"
                >
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} (Round {b.roundNumber}) {b.isPublished ? '● Published' : '🔒 Confidential'}
                    </option>
                  ))}
                </select>
                <div className="text-[10px] text-slate-500">
                  Questions are stored in this batch and will run when this specific round is hosted.
                </div>
              </div>

              {/* Question Format */}
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Question Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setQType('text')}
                    className={`py-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                      qType === 'text'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    Text Question (MCQ)
                  </button>
                  <button
                    type="button"
                    onClick={() => setQType('image')}
                    className={`py-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                      qType === 'image'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    Image Question (Diagram)
                  </button>
                </div>
              </div>

              {/* Image Upload if Image Type */}
              {qType === 'image' && (
                <div className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-200 space-y-2.5">
                  <div className="font-bold text-purple-800 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4" />
                    Upload Image or Paste Link
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      ref={questionImageInputRef}
                      onChange={handleQuestionImageUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => questionImageInputRef.current?.click()}
                      className="btn-secondary w-full py-2 text-xs flex items-center justify-center gap-2"
                    >
                      <Upload className="w-3.5 h-3.5 text-purple-600" />
                      Upload Diagram Image
                    </button>
                    <input
                      type="text"
                      placeholder="Or paste image URL"
                      value={qImage}
                      onChange={(e) => setQImage(e.target.value)}
                      className="w-full bg-white border border-purple-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  {qImage && (
                    <div className="relative rounded-xl border border-purple-200 bg-white p-2 text-center max-h-36 flex items-center justify-center">
                      <img src={qImage} alt="Preview" className="max-h-32 w-auto object-contain rounded" />
                      <button
                        type="button"
                        onClick={() => setQImage('')}
                        className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white text-[10px]"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Question Text */}
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Question Text / Prompt
                </label>
                <textarea
                  required
                  rows={2}
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  placeholder="Enter the question text..."
                  className="w-full bg-slate-50 border border-blue-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500"
                />
              </div>

              {/* Timer & Category Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Admin Question Timer Input */}
                <div>
                  <label className="block font-semibold text-amber-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Timer (Seconds)
                  </label>
                  <input
                    type="number"
                    required
                    min={5}
                    max={300}
                    value={qTimeLimit}
                    onChange={(e) => setQTimeLimit(Number(e.target.value))}
                    className="w-full bg-amber-50/50 border border-amber-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-900 focus:outline-none focus:border-amber-500"
                  />
                  <div className="text-[10px] text-slate-500 mt-0.5">e.g. 10, 15, 20, 30s</div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={qCategory}
                    onChange={(e) => setQCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-blue-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                  >
                    <option value="AI & ML">AI & Machine Learning</option>
                    <option value="Python & DSA">Python & DSA</option>
                    <option value="Cyber Security">Cyber Security</option>
                    <option value="Tech Trivia">Tech Trivia</option>
                    <option value="CMRTC Special">CMRTC Special</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Points
                  </label>
                  <input
                    type="number"
                    value={qPoints}
                    onChange={(e) => setQPoints(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-blue-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>
              </div>

              {/* 4 Choices */}
              <div className="space-y-2">
                <label className="block font-semibold text-slate-700 uppercase tracking-wider">
                  4 Options (Choose correct answer radio button)
                </label>
                {qOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="adminCorrectOption"
                      checked={qCorrectIndex === idx}
                      onChange={() => setQCorrectIndex(idx)}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="w-5 font-bold text-center text-slate-500">{CHOICE_ICONS[idx]}</span>
                    <input
                      type="text"
                      required
                      placeholder={`Option ${idx + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const copy = [...qOptions];
                        copy[idx] = e.target.value;
                        setQOptions(copy);
                      }}
                      className="flex-1 bg-slate-50 border border-blue-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                    />
                  </div>
                ))}
              </div>

              {/* Explanation */}
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Answer Explanation
                </label>
                <input
                  type="text"
                  placeholder="Explanation shown after students answer..."
                  value={qExplanation}
                  onChange={(e) => setQExplanation(e.target.value)}
                  className="w-full bg-slate-50 border border-blue-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full py-3 text-sm mt-2 flex items-center justify-center gap-2 font-bold"
              >
                <CheckCircle2 className="w-4 h-4" />
                {editingQuestionId ? 'Save Question Changes' : 'Add Question to Database'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= PARTICIPANT EDIT / ADD MODAL ================= */}
      {showParticipantModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-blue-200 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-blue-100 pb-2">
              <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                {editingParticipantId ? 'Edit Student Details' : 'Add New Student'}
              </h2>
              <button onClick={() => setShowParticipantModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleParticipantSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">Student Name</label>
                <input
                  type="text"
                  required
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  placeholder="e.g. Student Name"
                  className="w-full bg-slate-50 border border-blue-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Branch</label>
                  <select
                    value={pBranch}
                    onChange={(e) => setPBranch(e.target.value)}
                    className="w-full bg-slate-50 border border-blue-200 rounded-xl px-2 py-2 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                  >
                    <option value="CSE (AI & ML)">CSE (AI & ML)</option>
                    <option value="CSE Core">CSE Core</option>
                    <option value="CSE (Data Science)">CSE (Data Science)</option>
                    <option value="CSE (Cyber Security)">CSE (Cyber Security)</option>
                    <option value="ECE">ECE</option>
                    <option value="IT">IT</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Year</label>
                  <select
                    value={pYear}
                    onChange={(e) => setPYear(e.target.value)}
                    className="w-full bg-slate-50 border border-blue-200 rounded-xl px-2 py-2 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Score (Points)</label>
                  <input
                    type="number"
                    value={pScore}
                    onChange={(e) => setPScore(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-blue-200 rounded-xl px-3 py-2 font-mono text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Streak</label>
                  <input
                    type="number"
                    value={pStreak}
                    onChange={(e) => setPStreak(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-blue-200 rounded-xl px-3 py-2 font-mono text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary w-full py-2.5 text-xs mt-2">
                Save Student Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= ENLARGE IMAGE MODAL ================= */}
      {previewImageModal && (
        <div
          onClick={() => setPreviewImageModal(null)}
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="max-w-3xl max-h-[85vh] bg-white border border-blue-200 rounded-2xl p-4 relative shadow-2xl">
            <button onClick={() => setPreviewImageModal(null)} className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700">✕</button>
            <img src={previewImageModal} alt="Enlarged Diagram" className="max-h-[80vh] w-auto object-contain rounded-xl" />
          </div>
        </div>
      )}

    </div>
  );
};
