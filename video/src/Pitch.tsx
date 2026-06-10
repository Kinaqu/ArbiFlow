import React from "react";
import {
  AbsoluteFill,
  Audio,
  Series,
  getStaticFiles,
  interpolate,
  staticFile,
} from "remotion";
import { C } from "./theme";
import { BEAT_DUR, PITCH_TOTAL } from "./pitch-timeline";
import { P1Problem } from "./scenes/pitch/P1_Problem";
import { P2Solution } from "./scenes/pitch/P2_Solution";
import { P3Score } from "./scenes/pitch/P3_Score";
import { P4Moat } from "./scenes/pitch/P4_Moat";
import { P5Proof } from "./scenes/pitch/P5_Proof";
import { P6Vision } from "./scenes/pitch/P6_Vision";

// Optional audio dropped into video/public/: voiceover.mp3 ducks the music bed.
const files = getStaticFiles();
const hasMusic = files.some((f) => f.name === "music.mp3");
const hasVO = files.some((f) => f.name === "voiceover.mp3");

const DUCK = 0.25; // ≈ −12 dB under the voiceover (PITCH.md production note)
const VO_TAIL = 3875; // last VO words end ≈ frame 3862 — let the bed swell back

const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// music.mp3 (~7 min) outlasts the composition — no loop needed.
const musicVolume = (f: number) =>
  interpolate(f, [0, 30, PITCH_TOTAL - 45, PITCH_TOTAL], [0, 0.55, 0.55, 0], CLAMP) *
  (hasVO ? interpolate(f, [VO_TAIL, VO_TAIL + 45], [DUCK, 0.8], CLAMP) : 1);

export const Pitch: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <Series>
        <Series.Sequence durationInFrames={BEAT_DUR.problem}>
          <P1Problem />
        </Series.Sequence>
        <Series.Sequence durationInFrames={BEAT_DUR.solution}>
          <P2Solution />
        </Series.Sequence>
        <Series.Sequence durationInFrames={BEAT_DUR.score}>
          <P3Score />
        </Series.Sequence>
        <Series.Sequence durationInFrames={BEAT_DUR.moat}>
          <P4Moat />
        </Series.Sequence>
        <Series.Sequence durationInFrames={BEAT_DUR.proof}>
          <P5Proof />
        </Series.Sequence>
        <Series.Sequence durationInFrames={BEAT_DUR.vision}>
          <P6Vision />
        </Series.Sequence>
      </Series>

      {hasVO ? <Audio src={staticFile("voiceover.mp3")} /> : null}
      {hasMusic ? <Audio src={staticFile("music.mp3")} volume={musicVolume} /> : null}
    </AbsoluteFill>
  );
};
