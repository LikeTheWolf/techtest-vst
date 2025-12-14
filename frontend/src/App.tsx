import { Button } from "@blueprintjs/core";
import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import MiniClock from "./components/MiniClock";

const DEFAULT_SIZE = 200;
const WIDTH_RATIO = 0.8;
const HEIGHT_RATIO = 0.5;
const RESET_DURATION = 500;

function computeCenteredPosition(size: number): [number, number] {
  const width = size * WIDTH_RATIO;
  const height = size * HEIGHT_RATIO;
  const vw = typeof window !== "undefined" ? window.innerWidth : width;
  const vh = typeof window !== "undefined" ? window.innerHeight : height;
  return [Math.max((vw - width) / 2, 0), Math.max((vh - height) / 2, 0)];
}

function App() {
  const [isResetting, setIsResetting] = useState(false);
  const [size, setSize] = useState(DEFAULT_SIZE);
  const [location, setLocation] = useState<[number, number]>(() =>
    computeCenteredPosition(DEFAULT_SIZE)
  );

  const resetTimer = useRef<number | null>(null);

  const handleReset = useCallback(() => {
    if (resetTimer.current !== null) {
      window.clearTimeout(resetTimer.current);
    }

    // 2 steps to avoid the bug on repeated resets caused by same frame
    setIsResetting(true);

    requestAnimationFrame(() => {
      setSize(DEFAULT_SIZE);
      setLocation(computeCenteredPosition(DEFAULT_SIZE));

      resetTimer.current = window.setTimeout(() => {
        setIsResetting(false);
      }, RESET_DURATION);
    });
  }, [setLocation, setSize]);

  useEffect(() => {
    const onResize = () => handleReset();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, [handleReset]);

  return (
    <div className="App">
      <header className="app-header">
        <Button
          className="reset-button"
          icon="refresh"
          size="large"
          intent="danger"
          onClick={handleReset}
          disabled={isResetting}
        >
          Reset
        </Button>
      </header>

      <main className="app-main">
        <MiniClock
          size={size}
          setSize={setSize}
          location={location}
          setLocation={setLocation}
          isResetting={isResetting}
        />
      </main>
    </div>
  );
}

export default App;
