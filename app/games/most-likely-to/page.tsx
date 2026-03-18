"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SkipForward, Sparkles, Check } from "lucide-react";
import PlayerLobby from "@/app/components/player-lobby";
import GameHeader from "@/app/components/game-header";
import { useGameState } from "@/app/lib/use-game-state";
import { mostLikelyToPrompts } from "@/app/lib/game-data";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MostLikelyToPage() {
  const game = useGameState();
  const [prompts, setPrompts] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const startGame = useCallback((preGenerated?: string[]) => {
    const aiQuestions = preGenerated || [];
    setPrompts(shuffle([...aiQuestions, ...mostLikelyToPrompts]));
    setIndex(0);
    setVotes({});
    setShowResults(false);
    game.startGame();
  }, [game]);

  const vote = (voter: string, target: string) => {
    setVotes((prev) => ({ ...prev, [voter]: target }));
  };

  const allVoted = game.players.every((p) => votes[p]);

  const getResults = () => {
    const counts: Record<string, number> = {};
    Object.values(votes).forEach((target) => {
      counts[target] = (counts[target] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  };

  const next = () => {
    if (index + 1 >= prompts.length) {
      setPrompts(shuffle(mostLikelyToPrompts));
      setIndex(0);
    } else {
      setIndex((i) => i + 1);
    }
    setVotes({});
    setShowResults(false);
  };

  const generateAI = async () => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "most-likely-to",
          players: game.players,
        }),
      });
      const data = await res.json();
      if (data.question) {
        setPrompts((prev) => {
          const updated = [...prev];
          updated.splice(index, 0, data.question);
          return updated;
        });
        setVotes({});
        setShowResults(false);
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
        minPlayers={3}
        maxPlayers={20}
        gameName="Most Likely To"
        gameIcon="👑"
        gameType="most-likely-to"
      />
    );
  }

  const prompt = prompts[index];
  const results = getResults();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-white">
      <GameHeader
        title="Most Likely To"
        icon="👑"
        subtitle={`Round ${index + 1}`}
        onEndGame={game.resetGame}
      />

      {/* Prompt */}
      <div className="px-4 pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30 p-6 text-center"
          >
            <p className="text-xl font-bold">{prompt}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Voting or Results */}
      <div className="flex-1 overflow-auto px-4 py-4">
        {!showResults ? (
          <div className="flex flex-col gap-2">
            <p className="mb-2 text-center text-sm text-zinc-400">
              Everyone vote! Tap the person you think is most likely to...
            </p>
            {game.players.map((voter) => (
              <div key={voter} className="rounded-xl bg-zinc-900 p-3">
                <p className="mb-2 text-sm font-medium text-zinc-300">
                  {voter}&apos;s vote:{" "}
                  {votes[voter] && (
                    <span className="text-amber-400">{votes[voter]}</span>
                  )}
                </p>
                <div className="flex flex-wrap gap-1">
                  {game.players.map((target) => (
                    <button
                      key={target}
                      onClick={() => vote(voter, target)}
                      className={`rounded-lg px-3 py-1.5 text-sm transition-all ${
                        votes[voter] === target
                          ? "bg-amber-500 text-black font-medium"
                          : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                      }`}
                    >
                      {target}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="mb-2 text-center text-sm text-zinc-400">
              The people have spoken! Top voted drinks!
            </p>
            {results.map(([name, count], i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-center justify-between rounded-xl p-4 ${
                  i === 0
                    ? "bg-gradient-to-r from-amber-500/30 to-orange-500/30 border border-amber-500/50"
                    : "bg-zinc-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">
                    {i === 0 ? "👑" : i === 1 ? "🥈" : ""}
                  </span>
                  <span className="font-medium">{name}</span>
                </div>
                <span className="text-sm text-zinc-400">
                  {count} vote{count !== 1 ? "s" : ""} 🍺
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 p-4 pb-8">
        {!showResults ? (
          <>
            <button
              onClick={generateAI}
              disabled={aiLoading}
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-zinc-800 font-medium transition-colors hover:bg-zinc-700 disabled:opacity-50"
            >
              <Sparkles size={18} />
              {aiLoading ? "..." : "AI Prompt"}
            </button>
            <button
              onClick={() => setShowResults(true)}
              disabled={!allVoted}
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-violet-500 font-medium transition-all hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-30"
            >
              <Check size={18} />
              Show Results
            </button>
          </>
        ) : (
          <button
            onClick={next}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-violet-500 font-medium transition-all hover:shadow-lg hover:shadow-purple-500/25"
          >
            <SkipForward size={18} />
            Next Round
          </button>
        )}
      </div>
    </div>
  );
}
