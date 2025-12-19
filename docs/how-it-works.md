# How it works

App startup
1) index.tsx loads Blueprint CSS, global CSS, and renders App inside #root.
2) App creates state for size and location of the clock, plus a reset flag.

Clock rendering
- MiniClock receives size and location as props.
- It renders three sections for hours, minutes, seconds.
- A timer updates the time state once per second.

Dragging
- PointerTracker watches pointer events on the clock element.
- On the first pointer, the code stores the offset between the pointer and the top-left corner.
- As the pointer moves, the clock position is updated and clamped inside the viewport.

Pinch to resize
- When a second pointer starts, the gesture mode switches to resize.
- The distance between two pointers becomes the scale.
- The new size is clamped between minimum and maximum and also to keep it on-screen.
- The location is adjusted so the resize stays centered around the pinch midpoint.

Reset behavior
- Clicking Reset recenters the clock and restores its default size.
- A short reset flag enables a CSS transition so the clock animates to the center.
- Window resize/orientation change also triggers the same reset logic.
