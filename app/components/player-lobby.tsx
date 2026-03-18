"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Play, ArrowLeft, Sparkles, Loader2, Check } from "lucide-react";
import Link from "next/link";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PreGeneratedQuestions = any[];

type PlayerLobbyProps = {
  players: string[];
  onAddPlayer: (name: string) => void;
  onRemovePlayer: (index: number) => void;
  onStart: (preGenerated?: PreGeneratedQuestions) => void;
  minPlayers: number;
  maxPlayers: number;
  gameName: string;
  gameIcon: string;
  gameType: string;
};

const playerColors = [
  "bg-rose-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-cyan-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-orange-500",
];

const countOptions = [10, 15, 20, 30];

export default function PlayerLobby({
  players,
  onAddPlayer,
  onRemovePlayer,
  onStart,
  minPlayers,
  maxPlayers,
  gameName,
  gameIcon,
  gameType,
}: PlayerLobbyProps) {
  const [newName, setNewName] = useState("");
  const [useAI, setUseAI] = useState(false);
  const [aiCount, setAiCount] = useState(15);
  const [generating, setGenerating] = useState(false);
  const [preGenerated, setPreGenerated] = useState<PreGeneratedQuestions | null>(null);

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (trimmed && players.length < maxPlayers) {
      onAddPlayer(trimmed);
      setNewName("");
    }
  };

  const canStart = players.length >= minPlayers;

  const handleGenerate = async () => {
    setGenerating(true);
    setPreGenerated(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: gameType,
          players,
          count: aiCount,
        }),
      });
      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setPreGenerated(data.questions);
      }
    } catch {
      // Failed to generate
    }
    setGenerating(false);
  };

  const handleStart = () => {
    onStart(preGenerated || undefined);
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-white">
      <div className="flex items-center gap-3 border-b border-zinc-800 px-4 py-4">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 transition-colors hover:bg-zinc-700"
        >
          <ArrowLeft size={20} />
        </Link>
        <span className="text-2xl">{gameIcon}</span>
        <h1 className="text-xl font-bold">{gameName}</h1>
      </div>

      <div className="flex flex-1 flex-col gap-6 overflow-auto p-4">
        <div className="text-center">
          <p className="text-sm text-zinc-400">
            {minPlayers}-{maxPlayers} players needed
          </p>
          <p className="mt-1 text-lg font-semibold">
            {players.length} player{players.length !== 1 ? "s" : ""} joined
          </p>
        </div>

        {/* Add Player */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAdd();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Enter player name..."
            className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-500 outline-none focus:border-purple-500 transition-colors"
            maxLength={20}
          />
          <button
            type="submit"
            disabled={!newName.trim() || players.length >= maxPlayers}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500 text-white transition-all hover:bg-purple-400 disabled:opacity-30"
          >
            <Plus size={24} />
          </button>
        </form>

        {/* Player List */}
        <div className="flex flex-col gap-2">
          <AnimatePresence>
            {players.map((player, index) => (
              <motion.div
                key={`${player}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3 rounded-xl bg-zinc-900 px-4 py-3"
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${playerColors[index % playerColors.length]}`}
                >
                  {player[0].toUpperCase()}
                </div>
                <span className="flex-1 font-medium">{player}</span>
                <button
                  onClick={() => onRemovePlayer(index)}
                  className="text-zinc-500 transition-colors hover:text-red-400"
                >
                  <X size={18} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {players.length === 0 && (
            <p className="py-8 text-center text-zinc-600">
              Add players to get started!
            </p>
          )}
        </div>

        {/* AI Pre-Generate Section */}
        {canStart && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4"
          >
            <button
              onClick={() => {
                setUseAI(!useAI);
                if (useAI) setPreGenerated(null);
              }}
              className="flex w-full items-center gap-3"
            >
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-md transition-all ${
                  useAI
                    ? "bg-purple-500 text-white"
                    : "border border-zinc-600 bg-zinc-800"
                }`}
              >
                {useAI && <Check size={14} />}
              </div>
              <Sparkles size={18} className="text-purple-400" />
              <span className="flex-1 text-left font-medium">
                Pre-generate AI questions
              </span>
            </button>

            <AnimatePresence>
              {useAI && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <p className="mt-3 text-sm text-zinc-400">
                    Generate questions with Claude AI before the game starts.
                    You can still generate more mid-game.
                  </p>

                  {/* Count selector */}
                  <div className="mt-3 flex gap-2">
                    {countOptions.map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          setAiCount(c);
                          setPreGenerated(null);
                        }}
                        className={`flex-1 rounded-xl py-2 text-sm font-medium transition-all ${
                          aiCount === c
                            ? "bg-purple-500 text-white"
                            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>

                  {/* Generate button */}
                  <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-800 py-3 font-medium transition-colors hover:bg-zinc-700 disabled:opacity-50"
                  >
                    {generating ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Generating {aiCount} questions...
                      </>
                    ) : preGenerated ? (
                      <>
                        <Check size={18} className="text-emerald-400" />
                        {preGenerated.length} questions ready! Tap to regenerate
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        Generate {aiCount} questions
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Start Button */}
        <div className="mt-auto pb-4">
          <button
            onClick={handleStart}
            disabled={!canStart || generating}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-violet-500 py-4 text-lg font-bold transition-all hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-30 disabled:hover:shadow-none"
          >
            <Play size={22} />
            {generating
              ? "Generating..."
              : preGenerated
                ? `Start with ${preGenerated.length} AI questions`
                : "Start Game"}
            {!canStart &&
              !generating &&
              ` (need ${minPlayers - players.length} more)`}
          </button>
        </div>
      </div>
    </div>
  );
}
