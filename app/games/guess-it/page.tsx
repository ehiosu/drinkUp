"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SkipForward, Sparkles, Eye, Loader2 } from "lucide-react";
import PlayerLobby from "@/app/components/player-lobby";
import GameHeader from "@/app/components/game-header";
import { useGameState } from "@/app/lib/use-game-state";
import { guessItQuestions, type GuessItQuestion } from "@/app/lib/game-data";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function GuessItPage() {
  const game = useGameState();
  const [questions, setQuestions] = useState<GuessItQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const startGame = useCallback(
    (preGenerated?: GuessItQuestion[]) => {
      const ai = preGenerated || [];
      setQuestions(shuffle([...ai, ...guessItQuestions]));
      setIndex(0);
      setRevealed(false);
      game.startGame();
    },
    [game]
  );

  const next = () => {
    if (index + 1 >= questions.length) {
      setQuestions(shuffle(guessItQuestions));
      setIndex(0);
    } else {
      setIndex((i) => i + 1);
    }
    setRevealed(false);
  };

  const generateAI = async () => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "guess-it", players: game.players }),
      });
      const data = await res.json();
      if (data.question && data.answer) {
        setQuestions((prev) => {
          const updated = [...prev];
          updated.splice(index + 1, 0, data);
          return updated;
        });
      }
    } catch {
      // fallback handled server-side
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
        gameName="Guess It"
        gameIcon="🎯"
        gameType="guess-it"
      />
    );
  }

  const q = questions[index];
  if (!q) return null;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-white">
      <GameHeader
        title="Guess It"
        icon="🎯"
        subtitle={`Round ${index + 1}`}
        onEndGame={game.resetGame}
      />

      <div className="px-4 pt-6 text-center">
        <p className="text-sm text-zinc-400">
          Everyone makes a guess out loud!
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
        {/* Question */}
        <motion.div
          key={index}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full rounded-2xl border border-lime-500/30 bg-gradient-to-br from-lime-500/10 to-emerald-500/10 p-6 text-center"
        >
          <p className="text-xl font-semibold leading-snug">{q.question}</p>
        </motion.div>

        {/* Answer reveal */}
        <AnimatePresence>
          {revealed && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-500/20 to-green-500/20 p-6 text-center"
            >
              <p className="text-sm text-zinc-400">The answer is</p>
              <p className="mt-1 text-3xl font-bold text-emerald-400">
                {q.answer}
              </p>
              <p className="mt-2 text-sm text-zinc-400">
                Everyone who guessed wrong takes a shot! 🥃
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 p-4 pb-8">
        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-lime-500 to-emerald-600 text-lg font-bold transition-all hover:shadow-lg hover:shadow-lime-500/25"
          >
            <Eye size={20} />
            Reveal Answer
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={generateAI}
              disabled={aiLoading}
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-zinc-800 font-medium transition-colors hover:bg-zinc-700 disabled:opacity-50"
            >
              {aiLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Sparkles size={18} />
              )}
              {aiLoading ? "..." : "AI Question"}
            </button>
            <button
              onClick={next}
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-lime-500 to-emerald-600 font-medium transition-all hover:shadow-lg hover:shadow-lime-500/25"
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
