import { topicSeed, type Confidence, type Question } from "./data";

export type Mode = "topic" | "challenge";

export interface TopicStat {
  attempted: number;
  correct: number;
}

export interface Progress {
  points: number;
  pointsToday: number;
  answeredToday: number;
  streak: number;
  streakSecured: boolean;
  topics: Record<string, TopicStat>;
  confidentMisses: number;
  deck: string[];
  pokerLeft: number;
  patternXp: number;
}

export const DAILY_TARGET = 10;
export const STREAK_MILESTONE = 7;
const POINTS_PER_LEVEL = 75;

export const initialProgress: Progress = {
  points: 436,
  pointsToday: 25,
  answeredToday: 7,
  streak: 6,
  streakSecured: false,
  topics: structuredClone(topicSeed),
  confidentMisses: 2,
  deck: [],
  pokerLeft: 5,
  patternXp: 120,
};

export const levelFor = (points: number) => Math.floor(points / POINTS_PER_LEVEL) + 1;

export function titleFor(level: number) {
  if (level <= 3) return "Student";
  if (level <= 7) return "Intern";
  if (level <= 12) return "RMO";
  if (level <= 18) return "Registrar";
  return "Consultant";
}

export function levelProgress(points: number) {
  const into = points % POINTS_PER_LEVEL;
  return { into, size: POINTS_PER_LEVEL, pct: Math.round((into / POINTS_PER_LEVEL) * 100) };
}

export const accuracy = (t: TopicStat) => (t.attempted ? Math.round((t.correct / t.attempted) * 100) : 0);

export function weakest(topics: Record<string, TopicStat>, count: number) {
  return Object.entries(topics)
    .map(([name, stat]) => ({ name, stat, pct: accuracy(stat) }))
    .sort((a, b) => a.pct - b.pct)
    .slice(0, count);
}

export interface AnswerResult {
  next: Progress;
  gained: number;
  bonus: number;
  before: number;
  after: number;
  events: string[];
}

/** Pure scoring step so the UI can show exactly what changed. */
export function applyAnswer(p: Progress, q: Question, correct: boolean, confidence: Confidence | null, mode: Mode): AnswerResult {
  const events: string[] = [];
  const base = mode === "challenge" ? 7 : 5;
  const gained = correct ? base : 0;
  const stat = p.topics[q.topic] ?? { attempted: 0, correct: 0 };
  const before = accuracy(stat);
  const nextStat = { attempted: stat.attempted + 1, correct: stat.correct + (correct ? 1 : 0) };

  let points = p.points + gained;
  let pointsToday = p.pointsToday + gained;
  const answeredToday = p.answeredToday + 1;
  let streak = p.streak;
  let streakSecured = p.streakSecured;
  let bonus = 0;

  if (p.answeredToday < DAILY_TARGET && answeredToday >= DAILY_TARGET) {
    bonus = Math.round(pointsToday * 0.5);
    events.push(`Daily bonus unlocked: x1.5 on today's points, +${bonus}`);
    if (!streakSecured) {
      streak += 1;
      streakSecured = true;
      events.push(`Streak extended to ${streak} days`);
      if (streak === STREAK_MILESTONE) {
        bonus += 20;
        events.push("7-day milestone: Consistency Champion badge, +20");
      }
    }
    points += bonus;
    pointsToday += bonus;
  }

  const levelBefore = levelFor(p.points);
  const levelAfter = levelFor(points);
  if (levelAfter > levelBefore) events.push(`Level up: Level ${levelAfter}, ${titleFor(levelAfter)}`);

  const confidentMisses = p.confidentMisses + (!correct && confidence === "confident" ? 1 : 0);
  return {
    next: {
      ...p,
      points,
      pointsToday,
      answeredToday,
      streak,
      streakSecured,
      topics: { ...p.topics, [q.topic]: nextStat },
      confidentMisses,
    },
    gained,
    bonus,
    before,
    after: accuracy(nextStat),
    events,
  };
}
