import PointerTracker from "pointer-tracker";
import { useEffect, useRef, useState } from "react";

const WIDTH_RATIO = 0.8;
const HEIGHT_RATIO = 0.5;
const MAX_SCALE = 4;
const MIN_SCALE = 0.25;
const MIN_PADDING = 20;

type MiniClockProps = {
  size: number;
  setSize: (val: number) => void;
  location: [number, number];
  setLocation: (val: [number, number]) => void;
  isResetting: boolean;
};

function MiniClock({ size, setSize, location, setLocation, isResetting }: MiniClockProps) {
  const [time, updateTime] = useState(new Date());

  const ref = useRef(null);
  const dragOffsetRef = useRef([0, 0]); 
  const locationRef = useRef(location);
  const sizeRef = useRef(size);

  const pinchStartDistanceRef = useRef(0);
  const pinchStartSizeRef = useRef(0);
  const pinchStartCenterRef = useRef({ x: 0, y: 0 });
  const pinchStartLocationRef = useRef([0, 0]);
  const gestureModeRef = useRef("idle"); // "idle", "drag", or "resize"

  useEffect(() => { 
    sizeRef.current = size; 
  }, [size]);

  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  useEffect(() => {
    // mount
    const interval = setInterval(()=>{
      updateTime(new Date());
    }, 1000);
    
    return () => {
      // unmount
      clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    if (!ref.current) return;

    const tracker = new PointerTracker(ref.current, {
      start(pointer, event) { 
        const existing = tracker.startPointers.length;

        if (existing === 0) {
          const [left, top] = locationRef.current;

          const offsetX = pointer.pageX - left;
          const offsetY = pointer.pageY - top;

          dragOffsetRef.current = [offsetX, offsetY];

          gestureModeRef.current = "drag";
        }

        if (existing === 1) {
          gestureModeRef.current = "resize";

          const [p1] = tracker.startPointers;
          const p2 = pointer;

          const dx = p2.pageX - p1.pageX;
          const dy = p2.pageY - p1.pageY;

          const dist = Math.sqrt(dx * dx + dy * dy);

          pinchStartDistanceRef.current = dist;
          pinchStartSizeRef.current = sizeRef.current;

          const centerX = (p1.pageX + p2.pageX) / 2;
          const centerY = (p1.pageY + p2.pageY) / 2;
          pinchStartCenterRef.current = { x: centerX, y: centerY };

          pinchStartLocationRef.current = locationRef.current;

        }

        return true;
      },

      move(previousPointers, changedPointers, event) {
        const current = tracker.currentPointers;
        const activeSize = sizeRef.current;
        const width = activeSize * WIDTH_RATIO;
        const height = activeSize * HEIGHT_RATIO;
        const viewportWidth = typeof window !== "undefined" && window.innerWidth ? window.innerWidth : width;
        const viewportHeight = typeof window !== "undefined" && window.innerHeight ? window.innerHeight : height;
        const maxLeft = Math.max(MIN_PADDING, viewportWidth - width - MIN_PADDING);
        const maxTop = Math.max(MIN_PADDING, viewportHeight - height - MIN_PADDING);

        if (gestureModeRef.current === "drag" && current.length === 1) {
          const p = current[0];

          const [offsetX, offsetY] = dragOffsetRef.current;

          const newLeft = p.pageX - offsetX;
          const clampedLeft = clampNumber(newLeft, MIN_PADDING, maxLeft);
          const newTop = p.pageY - offsetY;
          const clampedTop = clampNumber(newTop, MIN_PADDING, maxTop);

          setLocation([clampedLeft, clampedTop]); 
        }

        if (gestureModeRef.current === "resize" && current.length === 2) {
          const [p1, p2] = current;

          const dx = p2.pageX - p1.pageX;
          const dy = p2.pageY - p1.pageY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const startDist = pinchStartDistanceRef.current;
          const startSize = pinchStartSizeRef.current;

          const scale = dist / startDist;
          const scaleClamp = clampNumber(scale, MIN_SCALE, MAX_SCALE);
          const proposedSize = startSize * scaleClamp;
          const maxSizeToFit = Math.min(
            (viewportWidth - 2 * MIN_PADDING) / WIDTH_RATIO,
            (viewportHeight - 2 * MIN_PADDING) / HEIGHT_RATIO
          );
          const newSize = clampNumber(
            proposedSize,
            startSize * MIN_SCALE,
            isFinite(maxSizeToFit) ? maxSizeToFit : proposedSize
          );

          setSize(newSize);

          const { x: cx, y: cy } = pinchStartCenterRef.current;
          const [startLeft, startTop] = pinchStartLocationRef.current;

          const oldWidth = startSize * WIDTH_RATIO;
          const oldHeight = startSize * HEIGHT_RATIO;

          const newWidth = newSize * WIDTH_RATIO;
          const newHeight = newSize * HEIGHT_RATIO;

          const oldCenterX = startLeft + oldWidth / 2;
          const oldCenterY = startTop + oldHeight / 2;

          const dxCenter = oldCenterX - cx;
          const dyCenter = oldCenterY - cy;

          const newCenterX = cx + dxCenter * scale;
          const newCenterY = cy + dyCenter * scale;

          const newLeft = newCenterX - newWidth / 2;
          const newTop = newCenterY - newHeight / 2;

          const newMaxLeft = Math.max(MIN_PADDING, viewportWidth - newWidth - MIN_PADDING);
          const newMaxTop = Math.max(MIN_PADDING, viewportHeight - newHeight - MIN_PADDING);
          const clampedLeft = clampNumber(newLeft, MIN_PADDING, newMaxLeft);
          const clampedTop = clampNumber(newTop, MIN_PADDING, newMaxTop);

          setLocation([clampedLeft, clampedTop]);
        }
      },

      end(pointer, event, cancelled) {
        const remaining = tracker.currentPointers.length;

        if (remaining === 0) {
          gestureModeRef.current = "idle";
        }

        if (remaining === 1 && gestureModeRef.current === "resize") {
          gestureModeRef.current = "drag";

          const p = tracker.currentPointers[0];
          const [left, top] = locationRef.current;

          const offsetX = p.pageX - left;
          const offsetY = p.pageY - top;

          dragOffsetRef.current = [offsetX, offsetY];
        }
      }
    });

    return () => {
      tracker.stop();
    };
  }, []);

  return (

    <div
      ref={ref}
      className={`miniclock ${isResetting ? "miniclock-resetting" : ""}`}
      style={{
        width: size * WIDTH_RATIO,
        height: size * HEIGHT_RATIO,
        paddingBottom: size * 0.02,
        fontSize: size * 0.18,
        position: "absolute",
        left: location[0],
        top: location[1],
      }}
    >
      <section>{twoDigits(time.getHours())}</section>
      <section className="colon">:</section>
      <section>{twoDigits(time.getMinutes())}</section>
      <section className="colon">:</section>
      <section>{twoDigits(time.getSeconds())}</section>
    </div>

  );
}

function twoDigits(n: number) {
  return n.toString().padStart(2, "0");
}

function clampNumber(num: number, a: number, b: number){
  return Math.max(Math.min(num, Math.max(a, b)), Math.min(a, b));
}

export default MiniClock;
