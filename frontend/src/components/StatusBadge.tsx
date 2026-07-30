import type { GameStatus } from "../types/game";

const LABELS: Record<GameStatus, string> = {
  WAITING: "In lobby",
  IN_PROGRESS: "Live",
  FINISHED: "Finished",
};

const MODIFIERS: Record<GameStatus, string> = {
  WAITING: "badge--waiting",
  IN_PROGRESS: "badge--live",
  FINISHED: "badge--finished",
};

export default function StatusBadge({ status }: { status: GameStatus }) {
  return <span className={`badge ${MODIFIERS[status]}`}>{LABELS[status]}</span>;
}
