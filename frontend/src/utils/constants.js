export const APP_NAME = process.env.REACT_APP_APP_NAME || 'PrepPilot';
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
export const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  INTERVIEW_SETUP: '/interview/setup',
  LIVE_INTERVIEW: '/interview/live/:id',
  CODING_INTERVIEW: '/interview/coding/:id',
  ANALYTICS: '/analytics',
  REPLAY: '/interview/replay/:id',
  PROFILE: '/profile',
  LEADERBOARD: '/leaderboard',
  ADMIN: '/admin',
};

export const INTERVIEW_TYPES = [
  { value: 'technical', label: 'Technical', icon: 'Cpu' },
  { value: 'behavioral', label: 'Behavioral', icon: 'Users' },
  { value: 'hr', label: 'HR', icon: 'Briefcase' },
  { value: 'coding', label: 'Coding', icon: 'Code' },
];

export const DIFFICULTY_LEVELS = [
  { value: 'easy', label: 'Easy', color: 'text-accent' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-400' },
  { value: 'hard', label: 'Hard', color: 'text-red-400' },
];

export const TARGET_ROLES = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Scientist',
  'DevOps Engineer',
  'Product Manager',
  'ML Engineer',
];

export const CODING_LANGUAGES = [
  { value: 'python', label: 'Python', monaco: 'python' },
  { value: 'javascript', label: 'JavaScript', monaco: 'javascript' },
  { value: 'java', label: 'Java', monaco: 'java' },
  { value: 'cpp', label: 'C++', monaco: 'cpp' },
  { value: 'go', label: 'Go', monaco: 'go' },
];

export const SUBSCRIPTION_TIERS = {
  free: { label: 'Free', interviews: 3, color: 'bg-gray-600' },
  pro: { label: 'Pro', interviews: 50, color: 'bg-primary' },
  enterprise: { label: 'Enterprise', interviews: -1, color: 'bg-accent' },
};

export const EMOTION_LABELS = {
  happy: { label: 'Confident', color: 'text-accent' },
  neutral: { label: 'Neutral', color: 'text-gray-400' },
  sad: { label: 'Nervous', color: 'text-yellow-400' },
  angry: { label: 'Stressed', color: 'text-red-400' },
  fear: { label: 'Anxious', color: 'text-orange-400' },
};

export const SCORE_THRESHOLDS = {
  excellent: 85,
  good: 70,
  average: 50,
};

export const TOKEN_KEY = 'preppilot_access_token';
export const REFRESH_KEY = 'preppilot_refresh_token';
export const USER_KEY = 'preppilot_user';

export const WS_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  INTERVIEW_START: 'interview:start',
  INTERVIEW_QUESTION: 'interview:question',
  INTERVIEW_RESPONSE: 'interview:response',
  INTERVIEW_FEEDBACK: 'interview:feedback',
  INTERVIEW_END: 'interview:end',
  EMOTION_UPDATE: 'emotion:update',
  VOICE_METRICS: 'voice:metrics',
  CODING_RESULT: 'coding:result',
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
};
