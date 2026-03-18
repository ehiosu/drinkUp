"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SkipForward, Sparkles, Play, Loader2 } from "lucide-react";
import PlayerLobby from "@/app/components/player-lobby";
import GameHeader from "@/app/components/game-header";
import { useGameState } from "@/app/lib/use-game-state";

type CountdownChallenge = {
  category: string;
  count: number;
  timeSeconds: number;
  examples: string[];
};

const builtInChallenges: CountdownChallenge[] = [
  { category: "Types of pizza toppings", count: 5, timeSeconds: 15, examples: ["pepperoni", "mushrooms", "olives", "onions", "sausage"] },
  { category: "Disney movies", count: 4, timeSeconds: 12, examples: ["Lion King", "Frozen", "Aladdin", "Moana"] },
  { category: "Social media platforms", count: 5, timeSeconds: 10, examples: ["Instagram", "TikTok", "Twitter", "Snapchat", "Facebook"] },
  { category: "Colors of the rainbow", count: 5, timeSeconds: 10, examples: ["red", "orange", "yellow", "green", "blue"] },
  { category: "Brands of cars", count: 6, timeSeconds: 15, examples: ["Toyota", "BMW", "Mercedes", "Ford", "Honda", "Tesla"] },
  { category: "Types of shoes", count: 4, timeSeconds: 12, examples: ["sneakers", "boots", "sandals", "heels"] },
  { category: "Ice cream flavors", count: 5, timeSeconds: 12, examples: ["vanilla", "chocolate", "strawberry", "mint", "cookies and cream"] },
  { category: "Countries in Europe", count: 6, timeSeconds: 15, examples: ["France", "Germany", "Italy", "Spain", "UK", "Netherlands"] },
  { category: "Musical instruments", count: 5, timeSeconds: 12, examples: ["guitar", "piano", "drums", "violin", "trumpet"] },
  { category: "Things you find in a bathroom", count: 5, timeSeconds: 12, examples: ["toothbrush", "soap", "towel", "mirror", "toilet"] },
  { category: "Fast food chains", count: 5, timeSeconds: 10, examples: ["McDonald's", "KFC", "Burger King", "Subway", "Wendy's"] },
  { category: "Sports with a ball", count: 6, timeSeconds: 15, examples: ["soccer", "basketball", "tennis", "golf", "volleyball", "cricket"] },
  { category: "Things that are red", count: 5, timeSeconds: 12, examples: ["fire truck", "strawberry", "stop sign", "blood", "roses"] },
  { category: "Types of dance", count: 4, timeSeconds: 12, examples: ["salsa", "ballet", "hip hop", "waltz"] },
  { category: "Breakfast foods", count: 5, timeSeconds: 12, examples: ["pancakes", "eggs", "cereal", "toast", "bacon"] },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function CountdownPage() {
  const game = useGameState();
  const [challenges, setChallenges] = useState<CountdownChallenge[]>([]);
  const [index, setIndex] = useState(0);
  const [timerState, setTimerState] = useState<"idle" | "running" | "done">("idle");
  const [timeLeft, setTimeLeft] = useState(0);
  const [result, setResult] = useState<"pass" | "fail" | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startGame = useCallback((preGenerated?: CountdownChallenge[]) => {
    const aiChallenges = preGenerated || [];
    setChallenges(shuffle([...aiChallenges, ...builtInChallenges]));
    setIndex(0);
    setTimerState("idle");
    setResult(null);
    game.startGame();
  }, [game]);

  const challenge = challenges[index];

  const startTimer = () => {
    if (!challenge) return;
    setTimerState("running");
    setTimeLeft(challenge.timeSeconds);
    setResult(null);
  };

  useEffect(() => {
    if (timerState === "running" && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            setTimerState("done");
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [timerState, timeLeft]);

  const handlePass = () => {
    setResult("pass");
    setTimerState("done");
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleFail = () => {
    setResult("fail");
    setTimerState("done");
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const next = () => {
    if (index + 1 >= challenges.length) {
      setChallenges(shuffle(builtInChallenges));
      setIndex(0);
    } else {
      setIndex((i) => i + 1);
    }
    setTimerState("idle");
    setResult(null);
    game.nextPlayer();
  };

  const generateAI = async () => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "countdown",
          players: game.players,
        }),
      });
      const data = await res.json();
      if (data.category && data.count) {
        setChallenges((prev) => {
          const updated = [...prev];
          updated.splice(index + 1, 0, data);
          return updated;
        });
      }
    } catch {
      // fallback
    }
    setAiLoading(false);
  };

  if (game.phase === "lobby") {
    return (
      <PlayerLobby
        players={game.players}
        onAddPlayer={game.addPlayer}
        onRemovePlayer={game.removePlayer}
        onStart={startGame}
        minPlayers={2}
        maxPlayers={20}
        gameName="Countdown"
        gameIcon="⏱️"
        gameType="countdown"
      />
    );
  }

  if (!challenge) return null;

  const timerPercent = challenge.timeSeconds > 0 ? timeLeft / challenge.timeSeconds : 0;
  const isUrgent = timerState === "running" && timeLeft <= 5;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-white">
      <GameHeader
        title="Countdown"
        icon="⏱️"
        subtitle={`Round ${index + 1}`}
        onEndGame={game.resetGame}
      />

      {/* Current Player */}
      <div className="px-4 pt-6 text-center">
        <p className="text-sm text-zinc-400">Your turn</p>
        <motion.p
          key={game.currentPlayer}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mt-1 text-2xl font-bold text-purple-400"
        >
          {game.currentPlayer}
        </motion.p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
        {/* Challenge card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full rounded-3xl border border-fuchsia-500/30 bg-gradient-to-br from-fuchsia-500/15 to-pink-500/15 p-6 text-center"
          >
            <p className="text-sm text-zinc-400">Name</p>
            <p className="mt-1 text-4xl font-black text-fuchsia-400">
              {challenge.count}
            </p>
            <p className="mt-2 text-xl font-semibold">{challenge.category}</p>
            <p className="mt-1 text-sm text-zinc-400">
              in {challenge.timeSeconds} seconds
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Timer */}
        {timerState !== "idle" && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="relative flex h-32 w-32 items-center justify-center">
              {/* Background circle */}
              <svg className="absolute h-full w-full -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="#27272a"
                  strokeWidth="8"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke={isUrgent ? "#ef4444" : "#d946ef"}
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - timerPercent)}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <motion.span
                key={timeLeft}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className={`text-4xl font-black ${
                  isUrgent ? "text-red-400" : "text-white"
                }`}
              >
                {timeLeft}
              </motion.span>
            </div>

            {timerState === "done" && timeLeft === 0 && result === null && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xl font-bold text-red-400"
              >
                TIME&apos;S UP!
              </motion.p>
            )}
          </motion.div>
        )}

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`w-full rounded-2xl border p-5 text-center ${
                result === "pass"
                  ? "border-emerald-500/40 bg-emerald-500/10"
                  : "border-red-500/40 bg-red-500/10"
              }`}
            >
              {result === "pass" ? (
                <>
                  <p className="text-2xl font-bold text-emerald-400">Nice! 🎉</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    Pick someone to drink!
                  </p>
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold text-red-400">Failed! 🍺</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    {game.currentPlayer} drinks!
                  </p>
                </>
              )}
              <div className="mt-3 text-xs text-zinc-500">
                Examples: {challenge.examples.join(", ")}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 p-4 pb-8">
        {timerState === "idle" && (
          <div className="flex gap-3">
            <button
              onClick={generateAI}
              disabled={aiLoading}
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-zinc-800 font-medium transition-colors hover:bg-zinc-700 disabled:opacity-50"
            >
              {aiLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {aiLoading ? "..." : "AI Challenge"}
            </button>
            <button
              onClick={startTimer}
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-pink-500 font-medium transition-all hover:shadow-lg hover:shadow-fuchsia-500/25"
            >
              <Play size={18} />
              Start Timer
            </button>
          </div>
        )}

        {timerState === "running" && (
          <div className="flex gap-3">
            <button
              onClick={handleFail}
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 font-medium text-red-400"
            >
              Failed
            </button>
            <button
              onClick={handlePass}
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 font-medium"
            >
              Got it!
            </button>
          </div>
        )}

        {timerState === "done" && result === null && (
          <div className="flex gap-3">
            <button
              onClick={handleFail}
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 font-medium text-red-400"
            >
              Didn&apos;t make it
            </button>
            <button
              onClick={handlePass}
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 font-medium"
            >
              They got it!
            </button>
          </div>
        )}

        {result !== null && (
          <div className="flex gap-3">
            <button
              onClick={generateAI}
              disabled={aiLoading}
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-zinc-800 font-medium transition-colors hover:bg-zinc-700 disabled:opacity-50"
            >
              {aiLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {aiLoading ? "..." : "AI Challenge"}
            </button>
            <button
              onClick={next}
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-violet-500 font-medium transition-all hover:shadow-lg hover:shadow-purple-500/25"
            >
              <SkipForward size={18} />
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
