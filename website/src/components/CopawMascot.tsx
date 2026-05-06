/**
 * CoPaw mascot (same as logo symbol). Used in Hero and Nav.
 */
import { CatPawIcon } from "./CatPawIcon.tsx";

interface xClawMascotProps {
  size?: number;
  className?: string;
}

export function xClawMascot({ size = 80, className = "" }: xClawMascotProps) {
  return <CatPawIcon size={size} className={className} />;
}
