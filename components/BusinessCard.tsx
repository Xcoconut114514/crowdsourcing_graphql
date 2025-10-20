"use client";
import { useAccount } from "wagmi";
import { QRCodeCanvas } from "qrcode.react";
import { shortAddr } from "@/lib/utils";

export default function BusinessCard() {
  const { address } = useAccount();
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/u/${address ?? ""}`
      : "https://nomad.ubi";

  return (
    <div className="pixel-card pink">
      <div className="badge-pixel">NOMAD CARD</div>
      <div className="mt-3 text-2xl font-extrabold">On-Chain Nomad</div>
      <div className="addr mono opacity-80" title={address || ""}>
        {shortAddr(address)}
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4 items-center">
        <div className="text-sm opacity-85">
          Scan to view public profile. Share your Nomad identity.
        </div>
        <div className="justify-self-end p-2 bg-white border-4 border-[var(--pink)]">
          <QRCodeCanvas value={shareUrl} size={132} includeMargin bgColor="#ffffff" fgColor="#000000" />
        </div>
      </div>

      <div className="mt-3 text-2xl font-extrabold pixel-title pink">
  On-Chain Nomad
</div>

      <div className="mt-4 flex gap-3">
        <a
          className="pixel-btn"
          href={`data:text/vcard;charset=utf-8,${encodeURIComponent(
            `BEGIN:VCARD
VERSION:3.0
FN:Nomad UBI
NOTE:Nomad profile ${address ?? ""}
END:VCARD`
          )}`}
          download="nomad-card.vcf"
        >
          Download vCard
        </a>
        <button className="btn-ghost" onClick={() => navigator.clipboard?.writeText(shareUrl)}>
          Copy Link
        </button>
      </div>
    </div>
  );
}
