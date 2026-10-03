import { useLayoutEffect, useRef } from "react";

export function EnemyName({ name }: { name: string }) {
  const ref = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    let active = true;
    const fit = () => {
      if (!active) return;
      element.style.fontSize = "21px";
      if (element.clientWidth > 0 && element.scrollWidth > element.clientWidth)
        element.style.fontSize = `${21 * element.clientWidth / element.scrollWidth}px`;
    };
    const observer = new ResizeObserver(fit);
    observer.observe(element);
    document.fonts.ready.then(fit);
    fit();
    return () => { active = false; observer.disconnect(); };
  }, [name]);
  return <strong ref={ref} className="enemy-name" title={name}>{name}</strong>;
}
