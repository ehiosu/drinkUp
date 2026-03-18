"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SkipForward, Sparkles } from "lucide-react";
import PlayerLobby from "@/app/components/player-lobby";
import GameHeader from "@/app/components/game-header";
import { useGameState } from "@/app/lib/use-game-state";
import { neverHaveIEverStatements } from "@/app/lib/game-data";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function NeverHaveIEverPage() {
  const game = useGameState();
  const [statements, setStatements] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [aiLoading, setAiLoading] = useState(false);

  const startGame = useCallback((preGenerated?: string[]) => {
    const aiQuestions = preGenerated || [];
    setStatements(shuffle([...aiQuestions, ...neverHaveIEverStatements]));
    setIndex(0);
    game.startGame();
  }, [game]);

  const next = () => {
    if (index + 1 >= statements.length) {
      setStatements(shuffle(neverHaveIEverStatements));
      setIndex(0);
    } else {
      setIndex((i) => i + 1);
    }
    game.nextPlayer();
  };

  const generateAI = async () => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "never-have-i-ever",
          players: game.players,
        }),
      });
      const data = await res.json();
      if (data.question) {
        setStatements((prev) => {
          const updated = [...prev];
          updated.splice(index, 0, data.question);
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
        gameName="Never Have I Ever"
        gameIcon="🙈"
        gameType="never-have-i-ever"
      />
    );
  }

  const statement = statements[index];

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-white">
      <GameHeader
        title="Never Have I Ever"
        icon="🙈"
        subtitle={`Round ${game.round}`}
        onEndGame={game.resetGame}
      />

      <div className="px-4 pt-6 text-center">
        <p className="text-sm text-zinc-400">{game.currentPlayer} reads:</p>
      </div>

      <div className="flex flex-1 items-center justify-center px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <div className="flex min-h-[240px] items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-500/30 p-8 text-center">
              <p className="text-2xl font-bold leading-relaxed">{statement}</p>
            </div>

            <p className="mt-6 text-center text-zinc-400">
              Drink if you&apos;ve done it! 🍺
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex gap-3 p-4 pb-8">
        <button
          onClick={generateAI}
          disabled={aiLoading}
          className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-zinc-800 font-medium transition-colors hover:bg-zinc-700 disabled:opacity-50"
        >
          <Sparkles size={18} />
          {aiLoading ? "Generating..." : "AI Prompt"}
        </button>
        <button
          onClick={next}
          className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 font-medium transition-all hover:shadow-lg hover:shadow-violet-500/25"
        >
          <SkipForward size={18} />
          Next
        </button>
      </div>
    </div>
  );
}
