"use client";

import { useState } from "react";
import { ArrowLeft, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

type GameHeaderProps = {
  title: string;
  icon: string;
  subtitle?: string;
  onEndGame: () => void;
};

export default function GameHeader({
  title,
  icon,
  subtitle,
  onEndGame,
}: GameHeaderProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleEnd = () => {
    setShowConfirm(false);
    onEndGame();
  };

  const handleHome = () => {
    router.push("/");
  };

  return (
    <>
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
        <button
          onClick={() => setShowConfirm(true)}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-2">
          {subtitle && (
            <span className="text-sm text-zinc-400">{subtitle}</span>
          )}
          <span className="text-sm font-medium">
            {icon} {title}
          </span>
        </div>
        <button
          onClick={() => setShowConfirm(true)}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800 text-zinc-400 transition-colors hover:bg-red-500/20 hover:text-red-400"
        >
          <X size={18} />
        </button>
      </div>

      {/* End Game Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-700 p-6"
            >
              <h3 className="text-lg font-bold text-white">Leave game?</h3>
              <p className="mt-2 text-sm text-zinc-400">
                Your current progress will be lost.
              </p>
              <div className="mt-6 flex flex-col gap-2">
                <button
                  onClick={handleHome}
                  className="flex w-full items-center justify-center rounded-xl bg-zinc-800 py-3 font-medium text-white transition-colors hover:bg-zinc-700"
                >
                  Back to Home
                </button>
                <button
                  onClick={handleEnd}
                  className="flex w-full items-center justify-center rounded-xl bg-purple-500/20 py-3 font-medium text-purple-400 transition-colors hover:bg-purple-500/30"
                >
                  Restart Game
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex w-full items-center justify-center rounded-xl py-3 font-medium text-zinc-400 transition-colors hover:text-white"
                >
                  Keep Playing
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
