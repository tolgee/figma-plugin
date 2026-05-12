<script lang="ts">
  import { send } from "$ui/lib/bus";
  import type { WindowSize } from "$shared/types";

  const MIN_WIDTH = 400;
  const MIN_HEIGHT = 160;
  const MAX_WIDTH = 800;
  const MAX_HEIGHT = 1000;

  let startPos: { x: number; y: number } | null = null;
  let startSize: WindowSize | null = null;
  let currentSize: WindowSize = { width: 500, height: 400 };

  function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  function onMouseDown(e: MouseEvent): void {
    e.preventDefault();
    startPos = { x: e.clientX, y: e.clientY };
    startSize = { ...currentSize };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }

  function onMouseMove(e: MouseEvent): void {
    if (!startPos || !startSize) return;
    const newSize: WindowSize = {
      width: clamp(startSize.width + e.clientX - startPos.x, MIN_WIDTH, MAX_WIDTH),
      height: clamp(startSize.height + e.clientY - startPos.y, MIN_HEIGHT, MAX_HEIGHT),
    };
    currentSize = newSize;
    send({ type: "resize", size: newSize });
  }

  function onMouseUp(): void {
    startPos = null;
    startSize = null;
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  }
</script>

<div
  role="separator"
  aria-label="Resize plugin window"
  class="absolute bottom-0 right-0 z-50 h-4 w-4 cursor-se-resize"
  onmousedown={onMouseDown}
>
  <svg
    width="10"
    height="10"
    viewBox="0 0 10 10"
    class="absolute bottom-1 right-1 text-[var(--color-text-secondary)] opacity-50"
    fill="currentColor"
  >
    <rect x="6" y="0" width="2" height="10" rx="1" />
    <rect x="0" y="6" width="10" height="2" rx="1" />
  </svg>
</div>
