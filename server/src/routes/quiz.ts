import { Router, Request, Response } from 'express';

export const quizRouter = Router();

export interface Player {
  id: string;
  name: string;
  branch: string;
  avatar: string;
  score: number;
  streak: number;
  lastAnsweredQuestion?: number;
}

export interface Room {
  pin: string;
  title: string;
  status: 'lobby' | 'question' | 'breakdown' | 'leaderboard' | 'ended';
  players: Player[];
  currentQuestion: number;
  batchId?: string;
  answeredCount: number;
  updatedAt: number;
}

// In-memory active rooms (starts completely clean, 0 dummy data)
const activeRooms: Record<string, Room> = {};

const normalizePin = (rawPin: string): string => {
  return (rawPin || '').replace(/[\s-_]/g, '').toLowerCase();
};

// Helper to get or create room
const getOrCreateRoom = (pin: string, title?: string): Room => {
  const norm = normalizePin(pin);
  if (!activeRooms[norm]) {
    activeRooms[norm] = {
      pin: norm,
      title: title || "Battle of Bits '26",
      status: 'lobby',
      players: [],
      currentQuestion: 0,
      answeredCount: 0,
      updatedAt: Date.now()
    };
  }
  return activeRooms[norm];
};

// GET /api/quiz/rooms - List active rooms
quizRouter.get('/rooms', (_req: Request, res: Response) => {
  res.json(Object.values(activeRooms));
});

// POST /api/quiz/room/register - Host creates or announces active room PIN
quizRouter.post('/room/register', (req: Request, res: Response) => {
  const { pin, title, batchId } = req.body;
  if (!pin) {
    return res.status(400).json({ error: 'Room PIN is required.' });
  }
  const norm = normalizePin(pin);
  const room = getOrCreateRoom(norm, title);
  if (title) room.title = title;
  if (batchId) room.batchId = batchId;
  room.updatedAt = Date.now();
  res.json({ success: true, room });
});

// GET /api/quiz/room/:pin - Get live room state
quizRouter.get('/room/:pin', (req: Request, res: Response) => {
  const norm = normalizePin(req.params.pin);
  const room = activeRooms[norm];
  if (!room) {
    return res.status(404).json({ error: 'Room not found. Please verify the PIN shown on the host projector.' });
  }
  res.json(room);
});

// POST /api/quiz/room/:pin/join - Player joins with PIN, nickname, and branch
quizRouter.post('/room/:pin/join', (req: Request, res: Response) => {
  const norm = normalizePin(req.params.pin);
  const { name, branch, avatar } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Nickname is required to join.' });
  }

  // Ensure room exists
  const room = getOrCreateRoom(norm);
  const cleanName = name.trim();

  // Check if player with this name already joined
  let player = room.players.find((p) => p.name.toLowerCase() === cleanName.toLowerCase());
  if (player) {
    // Re-connect existing player
    player.branch = branch || player.branch;
    player.avatar = avatar || player.avatar;
  } else {
    player = {
      id: `p-${Date.now()}-${Math.floor(Math.random() * 899 + 100)}`,
      name: cleanName,
      branch: branch || 'CSE (AI & ML)',
      avatar: avatar || '⚡',
      score: 0,
      streak: 0
    };
    room.players.push(player);
  }

  room.updatedAt = Date.now();
  res.json({ success: true, player, room });
});

// POST /api/quiz/room/:pin/answer - Player submits an answer
quizRouter.post('/room/:pin/answer', (req: Request, res: Response) => {
  const norm = normalizePin(req.params.pin);
  const room = activeRooms[norm];
  if (!room) {
    return res.status(404).json({ error: 'Room not found.' });
  }

  const { playerId, points, isCorrect, questionIndex } = req.body;
  const player = room.players.find((p) => p.id === playerId);
  if (player) {
    if (player.lastAnsweredQuestion !== questionIndex) {
      player.lastAnsweredQuestion = questionIndex;
      player.score += points || 0;
      player.streak = isCorrect ? player.streak + 1 : 0;
      room.answeredCount = (room.answeredCount || 0) + 1;
    }
  }

  room.updatedAt = Date.now();
  res.json({ success: true, player, answeredCount: room.answeredCount });
});

// POST /api/quiz/room/:pin/state - Host updates phase and question index
quizRouter.post('/room/:pin/state', (req: Request, res: Response) => {
  const norm = normalizePin(req.params.pin);
  const room = getOrCreateRoom(norm);
  const { status, currentQuestion } = req.body;

  if (status) room.status = status;
  if (typeof currentQuestion === 'number') {
    if (room.currentQuestion !== currentQuestion) {
      room.answeredCount = 0; // Reset marked count for new question
    }
    room.currentQuestion = currentQuestion;
  }

  room.updatedAt = Date.now();
  res.json({ success: true, room });
});

// POST /api/quiz/room/:pin/clear - Host clears players for new game
quizRouter.post('/room/:pin/clear', (req: Request, res: Response) => {
  const norm = normalizePin(req.params.pin);
  const room = activeRooms[norm];
  if (room) {
    room.players = [];
    room.status = 'lobby';
    room.currentQuestion = 0;
    room.answeredCount = 0;
    room.updatedAt = Date.now();
  }
  res.json({ success: true, room });
});

// GET /api/quiz/room/:pin/leaderboard - Real-time leaderboard for room
quizRouter.get('/room/:pin/leaderboard', (req: Request, res: Response) => {
  const norm = normalizePin(req.params.pin);
  const room = activeRooms[norm];
  if (!room) {
    return res.json([]);
  }
  const sorted = [...room.players].sort((a, b) => b.score - a.score);
  res.json(sorted);
});

// Fallback legacy endpoint
quizRouter.get('/leaderboard', (_req: Request, res: Response) => {
  const firstRoom = Object.values(activeRooms)[0];
  if (firstRoom) {
    return res.json([...firstRoom.players].sort((a, b) => b.score - a.score));
  }
  res.json([]);
});
