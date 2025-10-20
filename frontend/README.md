# Nomad UBI — Hackathon MVP (Next.js + Wagmi)

This starter lets you demo the **Proof → Score → UBI** loop in minutes, with a **Demo Mode** fallback and a clean adapter to swap in your real contracts later.

## ✨ Features
- Next.js 14 (App Router) + TypeScript + Tailwind
- RainbowKit + Wagmi + Viem (EVM testnets out of the box)
- Demo Mode (no chain) with local score decay + UBI claim simulation
- Simple "adapter" to plug your real Score/SBT/Vault contracts
- Minimal, judge-friendly UI: Landing + Dashboard (Score, Proofs, Claim)

## 🚀 Quickstart
```bash
# 1) install deps
pnpm i || yarn || npm i

# 2) run
pnpm dev || yarn dev || npm run dev
```

Open http://localhost:3000

## 🔌 Connect your chain
Set env variables (create `.env.local` from `.env.example`):
```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_id
NEXT_PUBLIC_RPC_BASE_SEPOLIA=...
NEXT_PUBLIC_RPC_POLYGON_AMOY=...
NEXT_PUBLIC_RPC_SEPOLIA=...
NEXT_PUBLIC_SCORE_ADDRESS=0xYourScoreContract
```

Then replace the ABI and calls in `lib/nomadAdapter.ts`.

## 🧪 Demo mode
- On the Dashboard toggle "Demo Mode".
- Use "Decay Tick" and "Claim UBI" to showcase the loop without chain access.

## 🧩 Where to add features quickly
- **Submit Proof on-chain:** extend `ProofForm` to call your VC/POAP/Task contract.
- **Nomad Score calc:** replace `readScore` in `lib/nomadAdapter.ts`.
- **SBT mint:** add a button calling your SBT contract (non-transferable).
- **Vault claim:** replace demo `claimUBI` with real claim on Vault.

## 🧯 Fallback plan for live demo
- Keep Demo Mode ON if RPC/contracts fail.
- Screens already visualize Score, Level, UBI and latest Proofs.

## 📄 Nomad paper + repo
Your project README with architecture lives here: https://github.com/KamisAyaka/crowdsourcing_graphql
