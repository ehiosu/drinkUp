"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SkipForward, Sparkles, Eye, Loader2 } from "lucide-react";
import PlayerLobby from "@/app/components/player-lobby";
import GameHeader from "@/app/components/game-header";
import { useGameState } from "@/app/lib/use-game-state";

type GuessChallenge = {
  category: string;
  answer: string;
  hints: string[];
};

const builtInChallenges: GuessChallenge[] = [
  { category: "Movie", answer: "Titanic", hints: ["Won 11 Academy Awards", "Set in 1912", "Features Jack and Rose"] },
  { category: "Song", answer: "Bohemian Rhapsody", hints: ["By a British rock band", "Released in 1975", "Is this the real life?"] },
  { category: "Celebrity", answer: "Beyoncé", hints: ["Born in Houston, Texas", "Former member of a girl group", "Married to a rapper"] },
  { category: "Country", answer: "Japan", hints: ["Island nation in Asia", "Known for cherry blossoms", "Home of sushi and anime"] },
  { category: "TV Show", answer: "Breaking Bad", hints: ["Set in New Mexico", "Involves chemistry", "Say my name"] },
  { category: "Movie", answer: "The Lion King", hints: ["An animated classic", "Set in Africa", "Hakuna Matata"] },
  { category: "Celebrity", answer: "Elon Musk", hints: ["Born in South Africa", "CEO of multiple companies", "Launched a car into space"] },
  { category: "Song", answer: "Shape of You", hints: ["Released in 2017", "By a British singer", "I'm in love with your body"] },
  { category: "Country", answer: "Brazil", hints: ["Largest country in South America", "Famous for carnival", "Home of the Amazon rainforest"] },
  { category: "TV Show", answer: "Stranger Things", hints: ["Set in the 1980s", "Features a girl with powers", "The Upside Down"] },
  { category: "Movie", answer: "Inception", hints: ["Directed by Christopher Nolan", "Dreams within dreams", "Is the top still spinning?"] },
  { category: "Celebrity", answer: "Taylor Swift", hints: ["Started in country music", "Has an Eras Tour", "Known for writing about exes"] },
  { category: "Food", answer: "Sushi", hints: ["Originated in Southeast Asia", "Uses vinegared rice", "Often served with wasabi"] },
  { category: "Brand", answer: "Nike", hints: ["Named after a Greek goddess", "Just Do It", "Famous swoosh logo"] },
  { category: "Animal", answer: "Octopus", hints: ["Has three hearts", "Can change color", "Has eight arms"] },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function GuessThePage() {
  const game = useGameState();
  const [challenges, setChallenges] = useState<GuessChallenge[]>([]);
  const [index, setIndex] = useState(0);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const startGame = useCallback((preGenerated?: GuessChallenge[]) => {
    const aiChallenges = preGenerated || [];
    setChallenges(shuffle([...aiChallenges, ...builtInChallenges]));
    setIndex(0);
    setHintsRevealed(0);
    setAnswered(false);
    setShowAnswer(false);
    game.startGame();
  }, [game]);

  const revealHint = () => {
    if (hintsRevealed < 3) {
      setHintsRevealed((h) => h + 1);
    }
  };

  const reveal = () => {
    setShowAnswer(true);
    setAnswered(true);
  };

  const next = () => {
    if (index + 1 >= challenges.length) {
      setChallenges(shuffle(builtInChallenges));
      setIndex(0);
    } else {
      setIndex((i) => i + 1);
    }
    setHintsRevealed(0);
    setAnswered(false);
    setShowAnswer(false);
    game.nextPlayer();
  };

  const generateAI = async () => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "guess-the",
          players: game.players,
        }),
      });
      const data = await res.json();
      if (data.category && data.answer && data.hints) {
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
        gameName="Guess The..."
        gameIcon="🔍"
        gameType="guess-the"
      />
    );
  }

  const challenge = challenges[index];
  if (!challenge) return null;

  const drinksOwed = hintsRevealed; // 1 drink per hint revealed before guessing

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-white">
      <GameHeader
        title="Guess The..."
        icon="🔍"
        subtitle={`Round ${index + 1}`}
        onEndGame={game.resetGame}
      />

      {/* Current Player */}
      <div className="px-4 pt-6 text-center">
        <p className="text-sm text-zinc-400">Guessing now</p>
        <motion.p
          key={game.currentPlayer}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mt-1 text-2xl font-bold text-purple-400"
        >
          {game.currentPlayer}
        </motion.p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
        {/* Category badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-full bg-yellow-500/20 border border-yellow-500/40 px-5 py-2"
        >
          <span className="text-sm font-semibold text-yellow-400">
            Guess the {challenge.category}
          </span>
        </motion.div>

        {/* Hints */}
        <div className="flex w-full flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <AnimatePresence key={i}>
              {i < hintsRevealed ? (
                <motion.div
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: "auto" }}
                  className="rounded-2xl border border-yellow-500/20 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 p-4"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500/30 text-xs font-bold text-yellow-300">
                      {i + 1}
                    </span>
                    <p className="font-medium">{challenge.hints[i]}</p>
                  </div>
                </motion.div>
              ) : (
                <div className="flex h-14 items-center justify-center rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/50">
                  <p className="text-sm text-zinc-600">
                    Hint {i + 1} — {i === 0 ? "easy" : i === 1 ? "medium" : "giveaway"}
                  </p>
                </div>
              )}
            </AnimatePresence>
          ))}
        </div>

        {/* Drinks counter */}
        {!answered && hintsRevealed > 0 && (
          <p className="text-sm text-zinc-400">
            Wrong guess = <span className="font-bold text-red-400">{drinksOwed} sip{drinksOwed !== 1 ? "s" : ""}</span>
          </p>
        )}

        {/* Answer reveal */}
        <AnimatePresence>
          {showAnswer && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-500/20 to-green-500/20 p-6 text-center"
            >
              <p className="text-sm text-zinc-400">The answer is</p>
              <p className="mt-1 text-3xl font-bold text-emerald-400">
                {challenge.answer}
              </p>
              {drinksOwed > 0 && (
                <p className="mt-2 text-sm text-zinc-400">
                  {drinksOwed} hint{drinksOwed !== 1 ? "s" : ""} used — wrong guessers take {drinksOwed} sip{drinksOwed !== 1 ? "s" : ""}! 🍺
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 p-4 pb-8">
        {!answered ? (
          <>
            <div className="flex gap-3">
              {hintsRevealed < 3 ? (
                <button
                  onClick={revealHint}
                  className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-yellow-500/20 border border-yellow-500/30 font-medium text-yellow-400 transition-all hover:bg-yellow-500/30"
                >
                  <Eye size={18} />
                  Reveal Hint {hintsRevealed + 1}
                </button>
              ) : (
                <button
                  onClick={generateAI}
                  disabled={aiLoading}
                  className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-zinc-800 font-medium transition-colors hover:bg-zinc-700 disabled:opacity-50"
                >
                  {aiLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                  {aiLoading ? "..." : "AI Challenge"}
                </button>
              )}
              <button
                onClick={reveal}
                className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-violet-500 font-medium transition-all hover:shadow-lg hover:shadow-purple-500/25"
              >
                Show Answer
              </button>
            </div>
          </>
        ) : (
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
