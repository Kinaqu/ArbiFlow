import { ImageResponse } from "next/og";

export const alt = "ArbiFlow — Deploy idle capital into optimized DeFi yield";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const MARK = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' fill='none'><defs><linearGradient id='g' x1='16' y1='30' x2='16' y2='2' gradientUnits='userSpaceOnUse'><stop offset='0' stop-color='#1E5BD8'/><stop offset='1' stop-color='#4A8FFF'/></linearGradient></defs><path d='M6 26.5C8.5 20 12 16.5 16 13.5' stroke='url(#g)' stroke-width='2.6' stroke-linecap='round'/><path d='M16 27V13.5' stroke='url(#g)' stroke-width='2.6' stroke-linecap='round'/><path d='M26 26.5C23.5 20 20 16.5 16 13.5' stroke='url(#g)' stroke-width='2.6' stroke-linecap='round'/><path d='M16 13.5V6.5' stroke='#F4B53F' stroke-width='3' stroke-linecap='round'/><path d='M11.8 10L16 5.6L20.2 10' stroke='#F4B53F' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/></svg>`;

export default function OpengraphImage() {
  const markSrc = `data:image/svg+xml,${encodeURIComponent(MARK)}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          backgroundColor: "#07080B",
          backgroundImage:
            "radial-gradient(circle at 85% 0%, rgba(47,123,255,0.20), transparent 52%)",
          color: "#F2F2EE",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={markSrc} width={62} height={62} alt="" />
          <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1 }}>
            ArbiFlow
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              maxWidth: 980,
              fontSize: 74,
              lineHeight: 1.05,
              letterSpacing: -2.5,
              fontWeight: 700,
            }}
          >
            Deploy idle capital into optimized DeFi yield
          </div>
          <div style={{ fontSize: 29, color: "#A8AEBC", letterSpacing: -0.4 }}>
            Arbitrum-native · 0–100 composite score · non-custodial
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 24,
            color: "#797F8E",
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: "#34E0A1",
            }}
          />
          <div>arbiflow.xyz · live on Arbitrum One</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
