
"use client";

export async function readScore(user: string) {
  const r = await fetch(`/api/score?user=${user}`, { cache: "no-store" });
  if (!r.ok) {
    const j = await r.json().catch(() => ({}));
    throw new Error(j.error || `HTTP ${r.status}`);
  }
  const j = await r.json();
  return Number(j.score ?? 0);
}


export const SCORE_ADDRESS =
  process.env.NEXT_PUBLIC_SCORE_ADDRESS ||
  "0x5b34DE9C5B069070F05bdE9d329B525b4F4BE5d9";
