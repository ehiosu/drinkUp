"use client";

import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import PlayerLobby from "@/app/components/player-lobby";
import GameHeader from "@/app/components/game-header";
import { useGameState } from "@/app/lib/use-game-state";

const dares = [
  "Take a sip!",
  "Take two sips!",
  "Do your best dance move!",
  "Tell an embarrassing story!",
  "Let someone post on your social media!",
  "Do 10 push-ups or drink!",
  "Speak in an accent for the next round!",
  "Let the group choose a song you have to sing!",
  "Swap an item of clothing with someone!",
  "Give a compliment to everyone in the room!",
  "Take a shot!",
  "Let someone draw on your face!",
  "Do your best impression of another player!",
  "Show your most recent selfie!",
  "Tell the group your celebrity crush!",
];

export default function SpinTheBottlePage() {
  const game = useGameState();
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [dare, setDare] = useState<string | null>(null);
  const [allDares, setAllDares] = useState<string[]>([...dares]);
  const bottleRef = useRef<HTMLDivElement>(null);

  const startGame = useCallback((preGenerated?: string[]) => {
    if (preGenerated && preGenerated.length > 0) {
      setAllDares([...preGenerated, ...dares]);
    } else {
      setAllDares([...dares]);
    }
    game.startGame();
  }, [game]);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setSelectedPlayer(null);
    setDare(null);

    const extraSpins = 1440 + Math.random() * 1440; // 4-8 full spins
    const playerAngle = 360 / game.players.length;
    const targetIndex = Math.floor(Math.random() * game.players.length);
    const targetAngle = targetIndex * playerAngle;
    const newRotation = rotation + extraSpins + targetAngle;

    setRotation(newRotation);

    setTimeout(() => {
      setSpinning(false);
      setSelectedPlayer(game.players[targetIndex]);
      setDare(allDares[Math.floor(Math.random() * allDares.length)]);
    }, 3000);
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
        gameName="Spin the Bottle"
        gameIcon="🍾"
        gameType="spin-the-bottle"
      />
    );
  }

  const playerColors = [
    "#f43f5e",
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#06b6d4",
    "#ec4899",
    "#6366f1",
    "#14b8a6",
    "#f97316",
  ];

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-white">
      <GameHeader
        title="Spin the Bottle"
        icon="🍾"
        subtitle={`${game.players.length} players`}
        onEndGame={game.resetGame}
      />

      {/* Circle of players */}
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
        <div className="relative h-72 w-72">
          {/* Players around the circle */}
          {game.players.map((player, i) => {
            const angle = (i * 360) / game.players.length - 90;
            const rad = (angle * Math.PI) / 180;
            const x = 50 + 42 * Math.cos(rad);
            const y = 50 + 42 * Math.sin(rad);
            const isSelected = player === selectedPlayer;

            return (
              <div
                key={player}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <motion.div
                  animate={
                    isSelected
                      ? { scale: [1, 1.3, 1.2], transition: { duration: 0.4 } }
                      : {}
                  }
                  className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold shadow-lg ${
                    isSelected ? "ring-2 ring-white" : ""
                  }`}
                  style={{
                    backgroundColor: playerColors[i % playerColors.length],
                  }}
                >
                  {player.slice(0, 2).toUpperCase()}
                </motion.div>
                <p
                  className={`mt-1 text-center text-[10px] ${
                    isSelected ? "font-bold text-white" : "text-zinc-400"
                  }`}
                >
                  {player}
                </p>
              </div>
            );
          })}

          {/* Bottle */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <motion.div
              ref={bottleRef}
              animate={{ rotate: rotation }}
              transition={{
                duration: 3,
                ease: [0.17, 0.67, 0.12, 0.99],
              }}
              className="flex h-20 w-8 items-center justify-center"
            >
              <div className="relative h-full w-full">
                {/* Bottle body */}
                <div className="absolute bottom-0 left-1/2 h-12 w-6 -translate-x-1/2 rounded-b-lg bg-gradient-to-t from-emerald-700 to-emerald-500" />
                {/* Bottle neck */}
                <div className="absolute top-0 left-1/2 h-8 w-2 -translate-x-1/2 rounded-t-full bg-emerald-500" />
                {/* Bottle pointer */}
                <div className="absolute top-0 left-1/2 h-0 w-0 -translate-x-1/2 border-4 border-transparent border-b-white" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Result */}
        {selectedPlayer && dare && !spinning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 p-6 text-center"
          >
            <p className="text-sm text-zinc-400">The bottle points to...</p>
            <p className="mt-1 text-2xl font-bold text-cyan-400">
              {selectedPlayer}
            </p>
            <p className="mt-3 text-lg font-medium">{dare}</p>
          </motion.div>
        )}
      </div>

      <div className="p-4 pb-8">
        <button
          onClick={spin}
          disabled={spinning}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 py-4 text-lg font-bold transition-all hover:shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 active:scale-95"
        >
          {spinning ? "Spinning..." : "Spin the Bottle!"}
        </button>
      </div>
    </div>
  );
}
