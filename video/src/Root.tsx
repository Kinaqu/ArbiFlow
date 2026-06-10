import { Composition } from "remotion";
import { Demo } from "./Demo";
import { Pitch } from "./Pitch";
import { FPS, HEIGHT, WIDTH } from "./theme";
import { TOTAL } from "./timeline";
import { PITCH_TOTAL } from "./pitch-timeline";

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="ArbiFlowDemo"
        component={Demo}
        durationInFrames={TOTAL}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="ArbiFlowPitch"
        component={Pitch}
        durationInFrames={PITCH_TOTAL}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
    </>
  );
};
