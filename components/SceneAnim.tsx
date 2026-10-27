import type { AnimType } from "@/lib/prompts/anim";
import "./scene-anim.css";

const SKIN = "#cfc6b8";
const HAIR = "#4a3a30";

/** Silhueta animada (9:16) que ilustra o movimento da cena. Só CSS/SVG, sem imagens. */
export function SceneAnim({ type, mirror = false, wearProduct = true }: { type: AnimType; mirror?: boolean; wearProduct?: boolean }) {
  const dressColor = wearProduct ? "var(--color-volt)" : "#4a4a58";
  return (
    <svg viewBox="0 0 90 160" className={`sa sa-${type}`} aria-hidden>
      <defs>
        <linearGradient id="sa-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#15151c" />
          <stop offset="1" stopColor="#0c0c10" />
        </linearGradient>
      </defs>
      <rect width="90" height="160" fill="url(#sa-bg)" />
      <line x1="0" y1="148" x2="90" y2="148" stroke="#23232c" strokeWidth="1" />

      {mirror && <rect x="14" y="10" width="62" height="140" rx="6" fill="none" stroke="#34343f" strokeWidth="2" />}

      {type === "curtain" && (
        <g className="sa-curtain">
          <rect className="sa-curtain-l" x="10" y="12" width="35" height="136" fill="#2b2b36" />
          <rect className="sa-curtain-r" x="45" y="12" width="35" height="136" fill="#26262f" />
        </g>
      )}

      {type === "hanger" && (
        <g className="sa-hanger">
          <path d="M45 22 q0 -6 5 -6 M45 22 L30 32 L60 32 Z" fill="none" stroke="#8a8a99" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M33 34 Q45 30 57 34 L55 58 L64 94 Q45 99 26 94 L35 58 Z" fill="var(--color-volt)" />
        </g>
      )}

      <g className="sa-cam">
        <g className="sa-fig">
          {/* cabelo de trás */}
          <path className="sa-hairback" d="M35 38 Q35 26 45 26 Q55 26 55 38 L57 62 Q45 66 33 62 Z" fill={HAIR} />
          {/* pernas */}
          <g className="sa-legs">
            <path d="M39 114 L38 146" stroke={SKIN} strokeWidth="4.5" strokeLinecap="round" />
            <path d="M51 114 L52 146" stroke={SKIN} strokeWidth="4.5" strokeLinecap="round" />
          </g>
          {/* pescoço e cabeça */}
          <rect x="42" y="45" width="6" height="9" rx="2" fill={SKIN} />
          <circle cx="45" cy="38" r="9" fill={SKIN} />
          <path className="sa-hairfront" d="M36 36 Q37 27 45 27 Q53 27 54 36 Q49 31 45 32 Q40 31 36 36 Z" fill={HAIR} />
          {/* roupa (produto) */}
          <path className="sa-dress" d="M33 54 Q45 50 57 54 L55 80 L64 116 Q45 121 26 116 L35 80 Z" fill={dressColor} />
          <path className="sa-mark" d="M41 54 L45 61 L49 54" fill="none" stroke="#0b0b0b" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          {/* braços */}
          <g className="sa-armL">
            <path d="M34 56 L29 84 L28 96" fill="none" stroke={SKIN} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            {type === "talk" && !wearProduct && <rect x="22" y="92" width="10" height="13" rx="2" fill="var(--color-volt)" />}
          </g>
          <g className="sa-armR">
            <path d="M56 56 L61 84 L62 96" fill="none" stroke={SKIN} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            {(mirror || type === "talk" || type === "flash") && (
              <rect className="sa-phone" x="58" y="92" width="8" height="13" rx="1.5" fill="#101015" stroke="#5d5d6b" strokeWidth="0.8" />
            )}
            {type === "lipstick" && <rect x="59" y="92" width="4" height="10" rx="1" fill="var(--color-volt)" />}
            {(type === "dab" || type === "mist") && <rect x="58" y="90" width="8" height="12" rx="2" fill="var(--color-volt)" />}
          </g>

          {type === "necklace" && (
            <g>
              <path d="M39 52 Q45 62 51 52" fill="none" stroke="var(--color-volt)" strokeWidth="0.9" />
              <circle cx="45" cy="59" r="1.8" fill="var(--color-volt)" />
              <path className="sa-spark" d="M49 57 l1 -2.5 l1 2.5 l2.5 1 l-2.5 1 l-1 2.5 l-1 -2.5 l-2.5 -1 Z" fill="#fff" />
            </g>
          )}
          {type === "earring" && (
            <g>
              <circle cx="54" cy="41" r="1.6" fill="var(--color-volt)" />
              <path className="sa-spark" d="M57 38 l0.8 -2 l0.8 2 l2 0.8 l-2 0.8 l-0.8 2 l-0.8 -2 l-2 -0.8 Z" fill="#fff" />
            </g>
          )}
          {type === "bag" && (
            <g className="sa-bag">
              <path d="M57 56 L64 86" stroke="#8a8a99" strokeWidth="1" />
              <rect x="58" y="84" width="16" height="13" rx="3" fill="var(--color-volt)" />
            </g>
          )}
        </g>
      </g>

      {type === "flash" && <circle className="sa-flash" cx="62" cy="96" r="10" fill="#fff" />}
      {type === "mist" && (
        <g className="sa-mistdots" fill="#e9e9f0">
          <circle cx="56" cy="50" r="0.9" /><circle cx="53" cy="48" r="0.7" /><circle cx="58" cy="46" r="0.8" /><circle cx="54" cy="44" r="0.6" />
        </g>
      )}
      {type === "talk" && (
        <g className="sa-waves" fill="none" stroke="var(--color-ghost)" strokeWidth="1.2" strokeLinecap="round">
          <path d="M60 34 q3 4 0 8" /><path d="M64 31 q5 7 0 14" />
        </g>
      )}
      {type === "unbox" && (
        <g>
          <rect x="30" y="122" width="30" height="20" rx="2" fill="#5a5a68" />
          <rect className="sa-lid" x="29" y="118" width="32" height="5" rx="1.5" fill="#6c6c7a" />
          <rect className="sa-item" x="39" y="118" width="12" height="14" rx="2" fill="var(--color-volt)" />
        </g>
      )}
      {(type === "dab" || type === "lipstick") && (
        <circle className="sa-glow" cx="45" cy="42" r="12" fill="var(--color-volt)" opacity="0" />
      )}
    </svg>
  );
}
