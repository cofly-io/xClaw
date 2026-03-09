/**
 * CoPaw mascot (same as logo symbol). Used in Hero and Nav.
 */
import { CatPawIcon } from "./CatPawIcon.tsx";

interface CopawMascotProps {
  size?: number;
  className?: string;
}

export function CopawMascot({ size = 80, className = "" }: CopawMascotProps) {
  return <CatPawIcon size={size} className={className} />;
}
