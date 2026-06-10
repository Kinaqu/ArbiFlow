import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { EASE } from "../lib/anim";
import { C } from "../theme";

/** Pointer that travels from→to over `travel` frames, then clicks (press + ripple). */
export const Cursor: React.FC<{
  from: [number, number];
  to: [number, number];
  startF: number;
  travel?: number;
  hideAfter?: number;
}> = ({ from, to, startF, travel = 18, hideAfter }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [startF, startF + travel], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });
  const x = from[0] + (to[0] - from[0]) * p;
  const y = from[1] + (to[1] - from[1]) * p;
  const clickF = startF + travel;
  const press = interpolate(frame, [clickF, clickF + 4, clickF + 12], [1, 0.8, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ringOpacity = interpolate(
    frame,
    [clickF, clickF + 3, clickF + 22],
    [0, 0.9, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const ringScale = interpolate(frame, [clickF, clickF + 22], [0.2, 1.3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const appear = interpolate(frame, [startF - 6, startF], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const gone =
    hideAfter != null
      ? interpolate(frame, [hideAfter, hideAfter + 8], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        opacity: appear * gone,
        transform: `scale(${press})`,
        transformOrigin: "top left",
        pointerEvents: "none",
        zIndex: 60,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 1,
          top: 1,
          width: 64,
          height: 64,
          marginLeft: -32,
          marginTop: -32,
          borderRadius: 999,
          border: `2px solid ${C.blueLight}`,
          opacity: ringOpacity,
          transform: `scale(${ringScale})`,
        }}
      />
      <svg
        width="44"
        height="44"
        viewBox="0 0 24 24"
        fill="none"
        style={{ filter: "drop-shadow(0 5px 9px rgba(0,0,0,0.65))" }}
      >
        <path
          d="M5 3l14 7.4-6.1 1.5-2.4 6.1L5 3z"
          fill="#fff"
          stroke={C.bg}
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
