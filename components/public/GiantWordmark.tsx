"use client";

import { useEffect, useRef } from "react";

// Design.md v2 §5.8: nama raksasa di dasar footer. Ukuran font dihitung
// ulang lewat DOM langsung (tanpa setState) supaya teks selalu pas selebar
// container, berapapun panjang namanya.
export function GiantWordmark({ text }: { text: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    const el = textRef.current;
    if (!box || !el) return;

    function fit() {
      if (!box || !el) return;
      el.style.fontSize = "100px";
      const width = el.getBoundingClientRect().width;
      if (width === 0) return;
      const size = Math.min((100 * box.clientWidth) / width, 320);
      el.style.fontSize = `${size}px`;
    }

    fit();
    document.fonts?.ready.then(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    return () => ro.disconnect();
  }, [text]);

  return (
    <div ref={boxRef} className="w-full overflow-hidden" aria-hidden="true">
      <span
        ref={textRef}
        className="wordmark inline-block select-none whitespace-nowrap pb-[0.08em] text-[clamp(2rem,9vw,9rem)] font-medium leading-[0.95] tracking-tighter"
      >
        {text}
      </span>
    </div>
  );
}
