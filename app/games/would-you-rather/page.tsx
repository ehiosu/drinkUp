"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SkipForward, Sparkles } from "lucide-react";
import PlayerLobby from "@/app/components/player-lobby";
import GameHeader from "@/app/components/game-header";
import { useGameState } from "@/app/lib/use-game-state";
import { wouldYouRatherQuestions } from "@/app/lib/game-data";

type WYRQuestion = { optionA: string; optionB: string };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function WouldYouRatherPage() {
  const game = useGameState();
  const [questions, setQuestions] = useState<WYRQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [votes, setVotes] = useState<Record<string, "A" | "B">>({});
  const [showResults, setShowResults] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const startGame = useCallback((preGenerated?: WYRQuestion[]) => {
    const aiQuestions = preGenerated || [];
    setQuestions(shuffle([...aiQuestions, ...wouldYouRatherQuestions]));
    setIndex(0);
    setVotes({});
    setShowResults(false);
    game.startGame();
  }, [game]);

  const vote = (player: string, choice: "A" | "B") => {
    setVotes((prev) => ({ ...prev, [player]: choice }));
  };

  const allVoted = game.players.every((p) => votes[p]);

  const getResults = () => {
    let a = 0,
      b = 0;
    const aVoters: string[] = [];
    const bVoters: string[] = [];
    Object.entries(votes).forEach(([player, choice]) => {
      if (choice === "A") {
        a++;
        aVoters.push(player);
      } else {
        b++;
        bVoters.push(player);
      }
    });
    return { a, b, aVoters, bVoters, minority: a <= b ? "A" : "B" };
  };

  const next = () => {
    if (index + 1 >= questions.length) {
      setQuestions(shuffle(wouldYouRatherQuestions));
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
          type: "would-you-rather",
          players: game.players,
        }),
      });
      const data = await res.json();
      if (data.optionA && data.optionB) {
        setQuestions((prev) => {
          const updated = [...prev];
          updated.splice(index, 0, {
            optionA: data.optionA,
            optionB: data.optionB,
          });
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
        minPlayers={2}
        maxPlayers={20}
        gameName="Would You Rather"
        gameIcon="🤔"
        gameType="would-you-rather"
      />
    );
  }

  const question = questions[index];
  const results = getResults();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-white">
      <GameHeader
        title="Would You Rather"
        icon="🤔"
        subtitle={`Round ${index + 1}`}
        onEndGame={game.resetGame}
      />

      <div className="flex flex-1 flex-col px-4 pt-6">
        <p className="text-center text-sm text-zinc-400 mb-4">
          Would you rather...
        </p>

        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col gap-3"
          >
            {/* Option A */}
            <div
              className={`rounded-2xl border p-5 text-center transition-all ${
                showResults && results.minority === "A"
                  ? "border-red-500/50 bg-red-500/10"
                  : "border-rose-500/30 bg-gradient-to-br from-rose-500/10 to-red-600/10"
              }`}
            >
              <p className="text-lg font-semibold">{question?.optionA}</p>
              {showResults && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2"
                >
                  <p className="text-2xl font-bold text-rose-400">
                    {results.a} vote{results.a !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {results.aVoters.join(", ")}
                  </p>
                  {results.minority === "A" && results.a > 0 && (
                    <p className="mt-1 text-sm text-red-400 font-medium">
                      Minority drinks! 🍺
                    </p>
                  )}
                </motion.div>
              )}
            </div>

            <p className="text-center text-sm font-bold text-zinc-500">OR</p>

            {/* Option B */}
            <div
              className={`rounded-2xl border p-5 text-center transition-all ${
                showResults && results.minority === "B"
                  ? "border-red-500/50 bg-red-500/10"
                  : "border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-indigo-600/10"
              }`}
            >
              <p className="text-lg font-semibold">{question?.optionB}</p>
              {showResults && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2"
                >
                  <p className="text-2xl font-bold text-blue-400">
                    {results.b} vote{results.b !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {results.bVoters.join(", ")}
                  </p>
                  {results.minority === "B" && results.b > 0 && (
                    <p className="mt-1 text-sm text-red-400 font-medium">
                      Minority drinks! 🍺
                    </p>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Voting section */}
        {!showResults && (
          <div className="mt-6 flex flex-col gap-2">
            <p className="text-center text-sm text-zinc-400">Everyone vote!</p>
            {game.players.map((player) => (
              <div
                key={player}
                className="flex items-center gap-2 rounded-xl bg-zinc-900 px-3 py-2"
              >
                <span className="flex-1 text-sm font-medium">{player}</span>
                <button
                  onClick={() => vote(player, "A")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    votes[player] === "A"
                      ? "bg-rose-500 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  A
                </button>
                <button
                  onClick={() => vote(player, "B")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    votes[player] === "B"
                      ? "bg-blue-500 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  B
                </button>
              </div>
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
              {aiLoading ? "..." : "AI Question"}
            </button>
            <button
              onClick={() => setShowResults(true)}
              disabled={!allVoted}
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-blue-500 font-medium transition-all hover:shadow-lg disabled:opacity-30"
            >
              Reveal
            </button>
          </>
        ) : (
          <button
            onClick={next}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-blue-500 font-medium"
          >
            <SkipForward size={18} />
            Next Round
          </button>
        )}
      </div>
    </div>
  );
}
