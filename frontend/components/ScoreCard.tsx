"use client";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { useDemo } from "@/lib/demoStore";
import { shortAddr } from "@/lib/utils";
import { readScore, SCORE_ADDRESS } from "@/lib/nomadAdapter";
import SbtMintButton from "@/components/SbtMintButton";
import UbiClaimButton from "@/components/UbiClaimButton";
export default function ScoreCard() {
  const { address } = useAccount();
  const demo = useDemo();
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<string>("");

  useEffect(() => {
    if (address && !demo.profile) {
      demo.setProfile({
        address,
        level: "Poor",
        score: 0,
        lastActive: new Date().toISOString(),
        weeklyUbi: 0,
      });
    }
  }, [address]);

  if (!address) return <div className="pixel-card pink">请先连接钱包。</div>;
  const p = demo.profile;

  async function handleRead() {
    setLoading(true);
    setLog("");
    try {
      if (!address) return alert("请先连接钱包");
const s = await readScore(address as string);

      demo.setProfile({
        address,
        level: s > 200 ? "Excellent" : s > 100 ? "Good" : "Poor",
        score: s,
        lastActive: new Date().toISOString(),
        weeklyUbi: Math.round((s / 100) * 10),
      });
      setLog(`读取成功: ${s}\n合约: ${SCORE_ADDRESS}\n地址: ${address}`);
    } catch (e: any) {
      setLog(`读取失败: ${e?.message || e}\n合约: ${SCORE_ADDRESS}\n地址: ${address}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pixel-card">
      <div className="flex items-center justify-between mb-2">
        <div className="text-lg font-bold" style={{fontFamily:'var(--font-pixel)'}}>Nomad Score</div>
        <span className="badge-pixel">DEMO MODE</span>
      </div>

      {/* 指标区：所有盒子都防溢出 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="pixel-card" style={{borderColor:"rgba(255,255,255,.15)", boxShadow:"none"}}>
          <div className="text-xs opacity-70">地址</div>
          <div className="addr mono" title={address}>{shortAddr(address)}</div>
        </div>
        <div className="pixel-card" style={{borderColor:"rgba(255,255,255,.15)", boxShadow:"none"}}>
          <div className="text-xs opacity-70">Score</div>
          <div className="text-3xl font-extrabold">{p?.score ?? 0}</div>
        </div>
        <div className="pixel-card" style={{borderColor:"rgba(255,255,255,.15)", boxShadow:"none"}}>
          <div className="text-xs opacity-70">SBT 等级</div>
          <div className="text-xl">{p?.level ?? "-"}</div>
        </div>
        <div className="pixel-card" style={{borderColor:"rgba(255,255,255,.15)", boxShadow:"none"}}>
          <div className="text-xs opacity-70">每周 UBI</div>
          <div className="text-xl">{p?.weeklyUbi ?? 0} U</div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-8">
  <button className="pixel-btn" onClick={handleRead} disabled={loading}>
    {loading ? "读取中…" : "读取链上分数"}
  </button>

  {/* 新增：SBT Mint & UBI Claim */}
  <SbtMintButton onSuccess={() => alert("（Demo）您可以在 UI 上标记 SBT 状态为已持有")} />
  <UbiClaimButton />

  <button className="btn-ghost" onClick={() => demo.decayTick()}>Decay Tick</button>
  <button className="btn-ghost" onClick={() => alert(`Claimed ${demo.claimUBI()} U (demo)`)}>Claim UBI (demo)</button>
</div>

      {/* 按钮区 */}
      <div className="mt-3 flex flex-wrap gap-8">
        <button className="pixel-btn" onClick={handleRead} disabled={loading}>
          {loading ? "读取中…" : "读取链上分数"}
        </button>
        <button className="btn-ghost" onClick={() => demo.decayTick()}>Decay Tick</button>
        <button className="btn-ghost" onClick={() => alert(`Claimed ${demo.claimUBI()} U (demo)`)}>
          Claim UBI
        </button>
      </div>

      {/* 调试信息：限制高度，滚动，不再把卡片撑爆 */}
      {log && (
        <pre className="scrollbox mono mt-4 whitespace-pre-wrap">{log}</pre>
      )}
    </div>
  );
}
