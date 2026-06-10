import React from "react";
import {
  AbsoluteFill,
  Audio,
  getStaticFiles,
  interpolate,
  staticFile,
} from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { C } from "./theme";
import { SCENE_DUR, TOTAL, TRANS } from "./timeline";
import { Bumper } from "./scenes/S0_Bumper";
import { Connect } from "./scenes/S1_Connect";
import { Scan } from "./scenes/S2_Scan";
import { Score } from "./scenes/S3_Score";
import { Deploy } from "./scenes/S4_Deploy";
import { AllowList } from "./scenes/S5_AllowList";
import { Rebalance } from "./scenes/S6_Rebalance";
import { Security } from "./scenes/S7_Security";
import { Outro } from "./scenes/S8_Outro";

const timing = linearTiming({ durationInFrames: TRANS });

// Optional soundtrack: drop a file at video/public/music.mp3 and it's picked up.
const hasMusic = getStaticFiles().some((f) => f.name === "music.mp3");

export const Demo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SCENE_DUR.bumper}>
          <Bumper />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DUR.connect}>
          <Connect />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={timing} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DUR.scan}>
          <Scan />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DUR.score}>
          <Score />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DUR.deploy}>
          <Deploy />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={timing} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DUR.allow}>
          <AllowList />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DUR.rebalance}>
          <Rebalance />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DUR.security}>
          <Security />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DUR.outro}>
          <Outro />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {hasMusic ? (
        <Audio
          src={staticFile("music.mp3")}
          volume={(f) =>
            interpolate(f, [0, 30, TOTAL - 45, TOTAL], [0, 0.55, 0.55, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          }
        />
      ) : null}
    </AbsoluteFill>
  );
};
