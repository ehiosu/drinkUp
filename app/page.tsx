"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { games } from "./lib/game-data";
import { Wine } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-white">
      {/* Header */}
      <header className="flex flex-col items-center gap-2 px-4 pt-12 pb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-violet-500 shadow-lg shadow-purple-500/25"
        >
          <Wine size={32} />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold tracking-tight"
        >
          DrinkUp
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-zinc-400"
        >
          Choose a game and let the fun begin
        </motion.p>
      </header>

      {/* Game Grid */}
      <main className="flex-1 px-4 pb-8">
        <div className="grid grid-cols-2 gap-3">
          {games.map((game, i) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i + 0.3 }}
            >
              <Link
                href={`/games/${game.id}`}
                className="flex flex-col gap-2 rounded-2xl bg-zinc-900 p-4 transition-all active:scale-95 hover:bg-zinc-800"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${game.color} text-2xl`}
                >
                  {game.icon}
                </div>
                <h2 className="font-semibold leading-tight">{game.name}</h2>
                <p className="text-xs leading-relaxed text-zinc-400">
                  {game.description}
                </p>
                <span className="mt-auto text-[10px] text-zinc-600">
                  {game.minPlayers}-{game.maxPlayers} players
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 px-4 py-4 text-center text-xs text-zinc-600">
        Please drink responsibly. 21+ only.
      </footer>
    </div>
  );
}
