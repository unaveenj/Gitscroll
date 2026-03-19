"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  type PanInfo,
  type MotionValue,
} from "framer-motion";
import type { GitHubRepo } from "@/types/github";
import { RepoCardPanel } from "./RepoCardPanel";

// Card dimensions — controlled here, not in RepoCardPanel
const CARD_W_MAX = 400;     // px — max card width (flashcard portrait feel)
const DRAG_THRESHOLD = 110; // px — drag distance to trigger advance
const PEEK_Y1 = 14;         // px — next card peeks below active
const PEEK_Y2 = 26;         // px — next-next card peeks further

// ─── BackCard ─────────────────────────────────────────────────────────────────
// Static peek card rendered behind the active card.

interface BackCardProps {
  repo: GitHubRepo;
  index: number;
  total: number;
  scaleX: MotionValue<number>;
  translateY: MotionValue<number>;
  opacity: MotionValue<number>;
}

function BackCard({ repo, index, total, scaleX, translateY, opacity }: BackCardProps) {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      style={{
        scale: scaleX,
        y: translateY,
        opacity,
        transformOrigin: "bottom center",
        willChange: "transform, opacity",
      }}
    >
      <RepoCardPanel repo={repo} index={index} total={total} />
    </motion.div>
  );
}

// ─── CardStack ────────────────────────────────────────────────────────────────

interface CardStackProps {
  repos: GitHubRepo[];
  currentIndex: number;
  onAdvance: () => void;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
}

export function CardStack({
  repos,
  currentIndex,
  onAdvance,
  onLoadMore,
  hasMore,
  isLoadingMore,
}: CardStackProps) {
  const cardY = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset drag position when the active card changes
  useEffect(() => {
    cardY.set(0);
  }, [currentIndex, cardY]);

  // Pre-fetch next page when 4 cards from the end
  useEffect(() => {
    if (hasMore && !isLoadingMore && repos.length - currentIndex < 5) {
      onLoadMore();
    }
  }, [currentIndex, repos.length, hasMore, isLoadingMore, onLoadMore]);

  // Keyboard navigation
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === " ") {
        e.preventDefault();
        triggerAdvance();
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, repos.length]);

  // ── Derived motion values ──────────────────────────────────────────────────
  // As the active card drags up (y goes negative), back cards scale/slide up.
  // clamp: true keeps transforms locked to the specified range.

  // Next card (index+1)
  const next1Scale = useTransform(cardY, [0, -DRAG_THRESHOLD], [0.953, 1.0], { clamp: true });
  const next1Y     = useTransform(cardY, [0, -DRAG_THRESHOLD], [PEEK_Y1, 0],  { clamp: true });
  const next1Op    = useTransform(cardY, [0, -DRAG_THRESHOLD], [0.82, 1.0],   { clamp: true });

  // Next-next card (index+2)
  const next2Scale = useTransform(cardY, [0, -DRAG_THRESHOLD], [0.906, 0.953], { clamp: true });
  const next2Y     = useTransform(cardY, [0, -DRAG_THRESHOLD], [PEEK_Y2, PEEK_Y1], { clamp: true });
  const next2Op    = useTransform(cardY, [0, -DRAG_THRESHOLD], [0.55, 0.82],   { clamp: true });

  // Active card fades and blurs slightly as it's dragged off
  const activeOp   = useTransform(cardY, [0, -DRAG_THRESHOLD * 1.5], [1, 0.3], { clamp: true });

  // ── Advance action ─────────────────────────────────────────────────────────
  const triggerAdvance = useCallback(() => {
    if (currentIndex >= repos.length) return;

    animate(cardY, -900, {
      type: "tween",
      ease: [0.4, 0, 1, 1], // accelerate out
      duration: 0.26,
      onComplete: () => {
        // Reset BEFORE triggering the re-render so the next card never
        // appears at y=-900 for even a single frame.
        cardY.set(0);
        onAdvance();
      },
    });
  }, [cardY, currentIndex, repos.length, onAdvance]);

  // ── Drag end handler ───────────────────────────────────────────────────────
  const handleDragEnd = useCallback(
    (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const draggedUp = info.offset.y < -DRAG_THRESHOLD;
      const fastFlick = info.velocity.y < -600;

      if (draggedUp || fastFlick) {
        triggerAdvance();
      } else {
        // Spring back to rest
        animate(cardY, 0, {
          type: "spring",
          stiffness: 380,
          damping: 32,
          mass: 0.9,
        });
      }
    },
    [cardY, triggerAdvance]
  );

  const active  = repos[currentIndex];
  const next1   = repos[currentIndex + 1];
  const next2   = repos[currentIndex + 2];
  const total   = repos.length;

  if (!active) return null;

  return (
    <div
      ref={containerRef}
      className="relative mx-auto px-4"
      style={{
        width: "100%",
        maxWidth: `${CARD_W_MAX + 32}px`,
        // clamp keeps cards flashcard-proportioned across all screen sizes:
        // min 460px so content never gets crushed, max 620px so they never
        // become full-page tiles on tall monitors.
        height: "clamp(460px, 58vh, 620px)",
        paddingBottom: `${PEEK_Y2 + 6}px`,
      }}
    >
      {/* ── next-next card (furthest back) ── */}
      {next2 && (
        <BackCard
          repo={next2}
          index={currentIndex + 2}
          total={total}
          scaleX={next2Scale}
          translateY={next2Y}
          opacity={next2Op}
        />
      )}

      {/* ── next card ── */}
      {next1 && (
        <BackCard
          repo={next1}
          index={currentIndex + 1}
          total={total}
          scaleX={next1Scale}
          translateY={next1Y}
          opacity={next1Op}
        />
      )}

      {/* ── active draggable card ── */}
      <motion.div
        className="absolute inset-0"
        style={{
          y: cardY,
          opacity: activeOp,
          zIndex: 30,
          cursor: "grab",
          willChange: "transform",
        }}
        drag="y"
        dragConstraints={{ top: -1200, bottom: 80 }}
        dragElastic={{ top: 0.12, bottom: 0.25 }}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        whileDrag={{ cursor: "grabbing" }}
      >
        {/*
         * key={active.id} forces RepoCardPanel to remount when the repo changes.
         * This resets the flip state so every new card starts face-up.
         */}
        <div key={active.id} className="w-full h-full">
          <RepoCardPanel repo={active} index={currentIndex} total={total} />
        </div>
      </motion.div>

      {/* ── Swipe hint ── */}
      {currentIndex < repos.length - 1 && (
        <SwipeHint cardY={cardY} />
      )}
    </div>
  );
}

// ─── SwipeHint ────────────────────────────────────────────────────────────────
// Thin pill at the very bottom of the card — fades out as the user starts dragging.

function SwipeHint({ cardY }: { cardY: MotionValue<number> }) {
  const opacity = useTransform(cardY, [0, -40], [1, 0], { clamp: true });

  return (
    <motion.div
      className="absolute inset-x-0 flex justify-center pointer-events-none"
      style={{
        bottom: "2px",
        zIndex: 40,
        opacity,
      }}
    >
      <span
        className="font-code text-[9px] tracking-[0.22em] uppercase flex items-center gap-1.5"
        style={{ color: "rgba(148,163,184,0.30)" }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="opacity-60">
          <path d="M5 8V2M2 5l3-3 3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        swipe up
      </span>
    </motion.div>
  );
}
