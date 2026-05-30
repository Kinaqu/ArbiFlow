import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const MARK = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' fill='none'><defs><linearGradient id='g' x1='16' y1='30' x2='16' y2='2' gradientUnits='userSpaceOnUse'><stop offset='0' stop-color='#1E5BD8'/><stop offset='1' stop-color='#4A8FFF'/></linearGradient></defs><path d='M6 26.5C8.5 20 12 16.5 16 13.5' stroke='url(#g)' stroke-width='2.6' stroke-linecap='round'/><path d='M16 27V13.5' stroke='url(#g)' stroke-width='2.6' stroke-linecap='round'/><path d='M26 26.5C23.5 20 20 16.5 16 13.5' stroke='url(#g)' stroke-width='2.6' stroke-linecap='round'/><path d='M16 13.5V6.5' stroke='#F4B53F' stroke-width='3' stroke-linecap='round'/><path d='M11.8 10L16 5.6L20.2 10' stroke='#F4B53F' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/></svg>`;

export default function AppleIcon() {
  const markSrc = `data:image/svg+xml,${encodeURIComponent(MARK)}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#07080B",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={markSrc} width={116} height={116} alt="" />
      </div>
    ),
    { ...size },
  );
}
