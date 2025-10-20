"use client";

export default function IslandPass(){
  return (
    <div className="pixel-card cyan">
      <div className="badge-pixel">ISLAND PASS (SBT)</div>

      <h3 className="mt-3 text-3xl font-extrabold pixel-title cyan">Good</h3>

      {/* 亮底内容面板：正文对比更强 */}
      <div className="pixel-surface mt-3">
        <p className="text-sm text-muted">
          Access to IRL nodes, events, and builder privileges.
        </p>

        {/* 关键权益点：行高更松、可读 */}
        <ul className="mt-3 space-y-2 text-sm">
          <li>• Entry to Nomad Islands</li>
          <li>• Event priority & builder track</li>
          <li>• Reputation-linked perks</li>
        </ul>
      </div>

      {/* 操作按钮：一深一亮形成对比 */}
      <div className="mt-4 flex gap-3">
        <button className="btn-ghost">View Traits</button>
        <button className="pixel-btn">Mint / Bind</button>
      </div>
    </div>
  );
}
