"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw } from "lucide-react";
import PlayerLobby from "@/app/components/player-lobby";
import GameHeader from "@/app/components/game-header";
import { useGameState } from "@/app/lib/use-game-state";
import { generateDeck, KingsCupCard } from "@/app/lib/game-data";

const suitSymbols = {
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
  spades: "♠",
};

const suitColors = {
  hearts: "text-red-500",
  diamonds: "text-red-500",
  clubs: "text-white",
  spades: "text-white",
};

export default function KingsCupPage() {
  const game = useGameState();
  const [deck, setDeck] = useState<KingsCupCard[]>([]);
  const [currentCard, setCurrentCard] = useState<KingsCupCard | null>(null);
  const [kingsDrawn, setKingsDrawn] = useState(0);
  const [cardsLeft, setCardsLeft] = useState(52);
  const [flipped, setFlipped] = useState(false);

  const startGame = useCallback(() => {
    const newDeck = generateDeck();
    setDeck(newDeck);
    setCurrentCard(null);
    setKingsDrawn(0);
    setCardsLeft(52);
    setFlipped(false);
    game.startGame();
  }, [game]);

  const drawCard = () => {
    if (deck.length === 0) return;

    const newDeck = [...deck];
    const card = newDeck.pop()!;
    setDeck(newDeck);
    setCurrentCard(card);
    setCardsLeft(newDeck.length);
    setFlipped(true);

    if (card.value === "K") {
      setKingsDrawn((k) => k + 1);
    }

    game.nextPlayer();
  };

  if (game.phase === "lobby") {
    return (
      <PlayerLobby
        players={game.players}
        onAddPlayer={game.addPlayer}
        onRemovePlayer={game.removePlayer}
        onStart={startGame}
        minPlayers={2}
        maxPlayers={10}
        gameName="Kings Cup"
        gameIcon="🃏"
        gameType="kings-cup"
      />
    );
  }

  const gameOver = kingsDrawn >= 4 || deck.length === 0;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-white">
      <GameHeader
        title="Kings Cup"
        icon="🃏"
        subtitle={`${cardsLeft} cards left`}
        onEndGame={game.resetGame}
      />

      {/* Kings counter */}
      <div className="flex justify-center gap-2 px-4 pt-4">
        {[1, 2, 3, 4].map((k) => (
          <div
            key={k}
            className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${
              k <= kingsDrawn
                ? "bg-amber-500 text-black"
                : "bg-zinc-800 text-zinc-500"
            }`}
          >
            K
          </div>
        ))}
      </div>

      {/* Current Player */}
      <div className="px-4 pt-4 text-center">
        <p className="text-sm text-zinc-400">
          {gameOver ? "Game Over!" : `${game.currentPlayer}'s turn`}
        </p>
      </div>

      {/* Card */}
      <div className="flex flex-1 items-center justify-center px-4">
        <AnimatePresence mode="wait">
          {currentCard && flipped ? (
            <motion.div
              key={`${currentCard.value}-${currentCard.suit}`}
              initial={{ rotateY: 90, scale: 0.8 }}
              animate={{ rotateY: 0, scale: 1 }}
              exit={{ rotateY: -90, scale: 0.8 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-[280px]"
            >
              <div className="rounded-3xl border border-zinc-700 bg-zinc-900 p-6">
                {/* Card top */}
                <div className="flex items-start justify-between">
                  <div className={`text-left ${suitColors[currentCard.suit]}`}>
                    <p className="text-3xl font-bold">{currentCard.value}</p>
                    <p className="text-2xl">{suitSymbols[currentCard.suit]}</p>
                  </div>
                </div>

                {/* Rule */}
                <div className="my-6 text-center">
                  <p className="text-2xl font-bold text-emerald-400">
                    {currentCard.rule}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                    {currentCard.description}
                  </p>
                </div>

                {/* Card bottom */}
                <div className="flex justify-end">
                  <div
                    className={`rotate-180 text-right ${suitColors[currentCard.suit]}`}
                  >
                    <p className="text-3xl font-bold">{currentCard.value}</p>
                    <p className="text-2xl">{suitSymbols[currentCard.suit]}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="flex h-[380px] w-full max-w-[280px] items-center justify-center rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-900/50 to-green-900/50"
            >
              <div className="text-center">
                <p className="text-5xl">🃏</p>
                <p className="mt-2 text-zinc-400">Tap to draw</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Draw Button */}
      <div className="p-4 pb-8">
        {gameOver ? (
          <div className="text-center">
            <p className="mb-4 text-lg font-bold text-amber-400">
              {kingsDrawn >= 4
                ? `${game.currentPlayer} drew the 4th King! DRINK THE CUP!`
                : "All cards drawn!"}
            </p>
            <button
              onClick={() => {
                game.resetGame();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 py-4 text-lg font-bold"
            >
              <RotateCcw size={20} />
              Play Again
            </button>
          </div>
        ) : (
          <button
            onClick={drawCard}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 py-4 text-lg font-bold transition-all hover:shadow-lg hover:shadow-emerald-500/25 active:scale-95"
          >
            Draw Card
          </button>
        )}
      </div>
    </div>
  );
}
