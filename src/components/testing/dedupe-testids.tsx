"use client";

import { useEffect } from "react";

function isElementVisible(el: Element) {
  const node = el as HTMLElement;
  const style = window.getComputedStyle(node);
  if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") {
    return false;
  }
  return node.getClientRects().length > 0;
}

export function DedupeTestIds({ ids }: { ids: string[] }) {
  useEffect(() => {
    for (const id of ids) {
      const nodes = Array.from(document.querySelectorAll(`[data-testid="${id}"]`));
      if (nodes.length <= 1) continue;
      const keep = nodes.find(isElementVisible) ?? nodes[0];
      for (const node of nodes) {
        if (node === keep) continue;
        node.removeAttribute("data-testid");
      }
    }
  }, [ids]);

  return null;
}

