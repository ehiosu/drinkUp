"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shuffle, Eye, RotateCcw, Minus, Plus } from "lucide-react";
import PlayerLobby from "@/app/components/player-lobby";
import GameHeader from "@/app/components/game-header";
import { useGameState } from "@/app/lib/use-game-state";
import { generateStandardDeck, type PlayingCard } from "@/app/lib/game-data";

const suitSymbols: Record<PlayingCard["suit"], string> = {
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
  spades: "♠",
};

type Dealt = { player: string; card: PlayingCard };

export default function LowCardPage() {
  const game = useGameState();
  const [dealt, setDealt] = useState<Dealt[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [loserCount, setLoserCount] = useState(1);

  const startGame = useCallback(() => {
    setDealt([]);
    setRevealed(false);
    setLoserCount(1);
    game.startGame();
  }, [game]);

  const deal = useCallback(() => {
    const deck = generateStandardDeck();
    setDealt(game.players.map((player, i) => ({ player, card: deck[i] })));
    setRevealed(false);
  }, [game.players]);

  // Players with the lowest cards drink. Ties at the cutoff all drink.
  const losers = useMemo(() => {
    if (dealt.length === 0) return new Set<number>();
    const ranks = dealt.map((d) => d.card.rank).sort((a, b) => a - b);
    const cutoff = ranks[Math.min(loserCount, ranks.length) - 1];
    return new Set(
      dealt
        .map((d, i) => (d.card.rank <= cutoff ? i : -1))
        .filter((i) => i >= 0)
    );
  }, [dealt, loserCount]);

  const maxLosers = Math.max(1, game.players.length - 1);

  if (game.phase === "lobby") {
    return (
      <PlayerLobby
        players={game.players}
        onAddPlayer={game.addPlayer}
        onRemovePlayer={game.removePlayer}
        onStart={startGame}
        minPlayers={2}
        maxPlayers={10}
        gameName="Low Card"
        gameIcon="🎴"
        gameType="low-card"
        disableAI
      />
    );
  }

  const hasDealt = dealt.length > 0;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-white">
      <GameHeader title="Low Card" icon="🎴" onEndGame={game.resetGame} />

      {/* Loser count selector */}
      <div className="flex items-center justify-center gap-3 px-4 pt-5">
        <span className="text-sm text-zinc-400">Lowest</span>
        <button
          onClick={() => setLoserCount((n) => Math.max(1, n - 1))}
          disabled={loserCount <= 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300 transition-colors hover:bg-zinc-700 disabled:opacity-30"
        >
          <Minus size={16} />
        </button>
        <span className="min-w-[1.5rem] text-center text-xl font-bold text-sky-400">
          {loserCount}
        </span>
        <button
          onClick={() => setLoserCount((n) => Math.min(maxLosers, n + 1))}
          disabled={loserCount >= maxLosers}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300 transition-colors hover:bg-zinc-700 disabled:opacity-30"
        >
          <Plus size={16} />
        </button>
        <span className="text-sm text-zinc-400">
          take{loserCount === 1 ? "s" : ""} a shot
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-1 flex-col items-center justify-center px-4">
        {!hasDealt ? (
          <p className="text-center text-zinc-500">
            Tap <span className="font-semibold text-zinc-300">Deal</span> to
            give everyone a card.
          </p>
        ) : (
          <div className="grid w-full max-w-md grid-cols-2 gap-3 sm:grid-cols-3">
            {dealt.map((d, i) => {
              const isLoser = revealed && losers.has(i);
              const red = d.card.suit === "hearts" || d.card.suit === "diamonds";
              return (
                <motion.div
                  key={`${d.player}-${i}`}
                  initial={{ opacity: 0, y: 20, rotateY: 180 }}
                  animate={{ opacity: 1, y: 0, rotateY: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div
                    className={`relative flex aspect-[3/4] w-full items-center justify-center rounded-xl border-2 transition-colors ${
                      isLoser
                        ? "border-red-500 bg-red-500/10"
                        : "border-zinc-700 bg-zinc-900"
                    }`}
                  >
                    {revealed ? (
                      <div
                        className={`flex flex-col items-center ${red ? "text-red-400" : "text-zinc-100"}`}
                      >
                        <span className="text-3xl font-bold leading-none">
                          {d.card.value}
                        </span>
                        <span className="text-2xl leading-none">
                          {suitSymbols[d.card.suit]}
                        </span>
                      </div>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-lg bg-gradient-to-br from-sky-500/30 to-indigo-600/30">
                        <Shuffle size={24} className="text-sky-300/60" />
                      </div>
                    )}
                    {isLoser && (
                      <span className="absolute -top-2 -right-2 text-xl">
                        🥃
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium ${isLoser ? "text-red-400" : "text-zinc-300"}`}
                  >
                    {d.player}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Result banner */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-4 mb-2 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-center"
          >
            <p className="text-sm text-zinc-400">Lowest card{losers.size !== 1 ? "s" : ""}</p>
            <p className="mt-1 font-bold text-red-400">
              {dealt
                .filter((_, i) => losers.has(i))
                .map((d) => d.player)
                .join(", ")}{" "}
              take{losers.size === 1 ? "s" : ""} a shot! 🥃
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex gap-3 p-4 pb-8">
        {!hasDealt ? (
          <button
            onClick={deal}
            className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 text-lg font-bold transition-all hover:shadow-lg hover:shadow-sky-500/25"
          >
            <Shuffle size={20} />
            Deal
          </button>
        ) : !revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 text-lg font-bold transition-all hover:shadow-lg hover:shadow-sky-500/25"
          >
            <Eye size={20} />
            Reveal
          </button>
        ) : (
          <button
            onClick={deal}
            className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 text-lg font-bold transition-all hover:shadow-lg hover:shadow-sky-500/25"
          >
            <RotateCcw size={20} />
            Deal Again
          </button>
        )}
      </div>
    </div>
  );
}
