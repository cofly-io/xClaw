/**
 * xClaw mascot (same as logo symbol). Used in Hero and Nav.
 */
import { CatPawIcon } from "./CatPawIcon";

interface XClawMascotProps {
  size?: number;
  className?: string;
}

export function XClawMascot({ size = 80, className = "" }: XClawMascotProps) {
  return <CatPawIcon size={size} className={className} />;
}
