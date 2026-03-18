"use client";

import { useState, useCallback } from "react";

export type GamePhase = "lobby" | "playing" | "finished";

export function useGameState() {
  const [players, setPlayers] = useState<string[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [phase, setPhase] = useState<GamePhase>("lobby");
  const [round, setRound] = useState(1);

  const addPlayer = useCallback((name: string) => {
    setPlayers((prev) => [...prev, name]);
  }, []);

  const removePlayer = useCallback((index: number) => {
    setPlayers((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const nextPlayer = useCallback(() => {
    setCurrentPlayerIndex((prev) => {
      const next = (prev + 1) % players.length;
      if (next === 0) setRound((r) => r + 1);
      return next;
    });
  }, [players.length]);

  const startGame = useCallback(() => {
    setPhase("playing");
    setCurrentPlayerIndex(0);
    setRound(1);
  }, []);

  const endGame = useCallback(() => {
    setPhase("finished");
  }, []);

  const resetGame = useCallback(() => {
    setPhase("lobby");
    setCurrentPlayerIndex(0);
    setRound(1);
  }, []);

  return {
    players,
    setPlayers,
    currentPlayer: players[currentPlayerIndex] || "",
    currentPlayerIndex,
    phase,
    round,
    addPlayer,
    removePlayer,
    nextPlayer,
    startGame,
    endGame,
    resetGame,
  };
}
