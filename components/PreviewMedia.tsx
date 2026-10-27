"use client";
import { useEffect, useRef, useState } from "react";
import type { AnimType } from "@/lib/prompts/anim";
import { SceneAnim } from "./SceneAnim";

/** Mostra o vídeo real (se houver) em loop mudo; senão a silhueta animada. O vídeo só carrega quando aparece na tela. */
export function PreviewMedia({
  src, anim, mirror, wearProduct, className = "",
}: { src?: string; anim: AnimType; mirror?: boolean; wearProduct?: boolean; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!src || !ref.current) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "200px" });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [src]);

  return (
    <div ref={ref} className={`relative overflow-hidden bg-ink ${className}`}>
      {src && !failed ? (
        visible ? (
          <video
            key={src}
            src={src}
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="h-full w-full bg-panel-2" />
        )
      ) : (
        <SceneAnim type={anim} mirror={mirror} wearProduct={wearProduct} />
      )}
      {src && !failed && <span className="absolute left-1 top-1 rounded bg-black/60 px-1 py-0.5 text-[0.55rem] font-mono text-volt">REAL</span>}
    </div>
  );
}
