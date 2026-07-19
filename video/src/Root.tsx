import {Composition} from "remotion";
import {FPS, HEIGHT, TOTAL_FRAMES, WIDTH} from "./config";
import {NewEraBuildWeek} from "./NewEraBuildWeek";

export const RemotionRoot = () => (
  <Composition
    id="NewEraBuildWeek"
    component={NewEraBuildWeek}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
