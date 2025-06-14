
import { type Position } from "@/utils/boardUtils";

// Retorna true se todos os pontos estão numa linha reta (horizontal, vertical ou diagonal)
export function isLinearPath(path: Position[]): boolean {
  if (path.length < 2) return true;
  const dRow = path[1].row - path[0].row;
  const dCol = path[1].col - path[0].col;
  // Todos os passos seguintes precisam manter este delta
  for (let i = 1; i < path.length; i++) {
    const stepRow = path[i].row - path[i-1].row;
    const stepCol = path[i].col - path[i-1].col;
    if (stepRow !== dRow || stepCol !== dCol) return false;
  }
  // Restringe a linha: vertical (dCol==0), horizontal (dRow==0), diagonal (|dRow|==|dCol|)
  if (
    (dRow !== 0 && dCol === 0) || 
    (dRow === 0 && dCol !== 0) || 
    (Math.abs(dRow) === Math.abs(dCol))
  ) {
    return true;
  }
  return false;
}
