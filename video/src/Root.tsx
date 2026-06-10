import { Composition } from "remotion";
import { Demo } from "./Demo";
import { FPS, HEIGHT, WIDTH } from "./theme";
import { TOTAL } from "./timeline";

export const Root: React.FC = () => {
  return (
    <Composition
      id="ArbiFlowDemo"
      component={Demo}
      durationInFrames={TOTAL}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  );
};
