import { Router, Request, Response } from 'express';

export const quizRouter = Router();

// In-memory rooms state
interface Player {
  id: string;
  name: string;
  branch: string;
  avatar: string;
  score: number;
  streak: number;
}

interface Room {
  pin: string;
  title: string;
  status: 'lobby' | 'in_progress' | 'ended';
  players: Player[];
  currentQuestion: number;
}

const activeRooms: Record<string, Room> = {
  '742918': {
    pin: '742918',
    title: 'AI CLUB CMRTC - Battle of Bits 2026',
    status: 'lobby',
    players: [
      { id: '1', name: 'Suhas Reddy', branch: 'CSE (AI&ML)', avatar: '⚡', score: 4890, streak: 5 },
      { id: '2', name: 'Ananya Sharma', branch: 'CSE Core', avatar: '🚀', score: 4620, streak: 4 },
      { id: '3', name: 'Karthik Varma', branch: 'CSE (DS)', avatar: '🧠', score: 4380, streak: 3 },
      { id: '4', name: 'Deepika Rao', branch: 'CSE (Cyber)', avatar: '🛡️', score: 4150, streak: 3 },
      { id: '5', name: 'Vikram Joshi', branch: 'ECE', avatar: '🤖', score: 3940, streak: 2 },
    ],
    currentQuestion: 0,
  }
};

// GET /api/quiz/room/:pin
quizRouter.get('/room/:pin', (req: Request, res: Response) => {
  const pin = req.params.pin;
  const room = activeRooms[pin];
  if (!room) {
    return res.status(404).json({ error: 'Room not found. Please verify PIN.' });
  }
  res.json(room);
});

// POST /api/quiz/room/:pin/join
quizRouter.post('/room/:pin/join', (req: Request, res: Response) => {
  const pin = req.params.pin;
  const { name, branch, avatar } = req.body;

  if (!activeRooms[pin]) {
    // Auto-create room for demo
    activeRooms[pin] = {
      pin,
      title: 'Auditorium Session',
      status: 'lobby',
      players: [],
      currentQuestion: 0,
    };
  }

  const room = activeRooms[pin];
  const newPlayer: Player = {
    id: Date.now().toString(),
    name: name || 'Anonymous Coder',
    branch: branch || 'CSE (AI&ML)',
    avatar: avatar || '🤖',
    score: 0,
    streak: 0,
  };

  room.players.push(newPlayer);
  res.json({ success: true, player: newPlayer, room });
});

// GET /api/quiz/leaderboard
quizRouter.get('/leaderboard', (req: Request, res: Response) => {
  const room = activeRooms['742918'];
  res.json(room.players.sort((a, b) => b.score - a.score));
});
