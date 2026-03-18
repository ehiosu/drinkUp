"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SkipForward, Sparkles } from "lucide-react";
import PlayerLobby from "@/app/components/player-lobby";
import GameHeader from "@/app/components/game-header";
import { useGameState } from "@/app/lib/use-game-state";
import { truthOrDrinkQuestions } from "@/app/lib/game-data";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function TruthOrDrinkPage() {
  const game = useGameState();
  const [questions, setQuestions] = useState<string[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const startGame = useCallback((preGenerated?: string[]) => {
    const aiQuestions = preGenerated || [];
    setQuestions(shuffle([...aiQuestions, ...truthOrDrinkQuestions]));
    setQuestionIndex(0);
    setRevealed(false);
    game.startGame();
  }, [game]);

  const nextQuestion = () => {
    if (questionIndex + 1 >= questions.length) {
      setQuestions(shuffle(truthOrDrinkQuestions));
      setQuestionIndex(0);
    } else {
      setQuestionIndex((i) => i + 1);
    }
    setRevealed(false);
    game.nextPlayer();
  };

  const generateAIQuestion = async () => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "truth-or-drink",
          players: game.players,
          currentPlayer: game.currentPlayer,
        }),
      });
      const data = await res.json();
      if (data.question) {
        setQuestions((prev) => {
          const updated = [...prev];
          updated.splice(questionIndex, 0, data.question);
          return updated;
        });
        setRevealed(false);
      }
    } catch {
      // fallback to next built-in question
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
        gameName="Truth or Drink"
        gameIcon="🍷"
        gameType="truth-or-drink"
      />
    );
  }

  const question = questions[questionIndex];

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-white">
      <GameHeader
        title="Truth or Drink"
        icon="🍷"
        subtitle={`Round ${game.round}`}
        onEndGame={game.resetGame}
      />

      {/* Current Player */}
      <div className="px-4 pt-6 text-center">
        <p className="text-sm text-zinc-400">It&apos;s your turn</p>
        <motion.p
          key={game.currentPlayer}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mt-1 text-2xl font-bold text-purple-400"
        >
          {game.currentPlayer}
        </motion.p>
      </div>

      {/* Question Card */}
      <div className="flex flex-1 items-center justify-center px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={questionIndex}
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <div
              onClick={() => setRevealed(true)}
              className={`flex min-h-[240px] cursor-pointer items-center justify-center rounded-3xl bg-gradient-to-br from-rose-500/20 to-pink-600/20 border border-rose-500/30 p-8 text-center transition-all ${
                !revealed ? "hover:border-rose-400/50" : ""
              }`}
            >
              {revealed ? (
                <p className="text-xl font-semibold leading-relaxed">
                  {question}
                </p>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <span className="text-4xl">🍷</span>
                  <p className="text-lg text-zinc-400">Tap to reveal</p>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="flex gap-3 p-4 pb-8">
        <button
          onClick={generateAIQuestion}
          disabled={aiLoading}
          className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-zinc-800 font-medium transition-colors hover:bg-zinc-700 disabled:opacity-50"
        >
          <Sparkles size={18} />
          {aiLoading ? "Generating..." : "AI Question"}
        </button>
        <button
          onClick={nextQuestion}
          className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-violet-500 font-medium transition-all hover:shadow-lg hover:shadow-purple-500/25"
        >
          <SkipForward size={18} />
          Next
        </button>
      </div>
    </div>
  );
}
