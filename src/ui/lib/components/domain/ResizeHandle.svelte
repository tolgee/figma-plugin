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
      width: clamp(
        startSize.width + e.clientX - startPos.x,
        MIN_WIDTH,
        MAX_WIDTH,
      ),
      height: clamp(
        startSize.height + e.clientY - startPos.y,
        MIN_HEIGHT,
        MAX_HEIGHT,
      ),
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
  role="none"
  class="group absolute bottom-0 right-0 z-50 h-4 w-4 cursor-se-resize"
  onmousedown={onMouseDown}
>
  <!-- Classic diagonal "grip" affordance: three short parallel strokes nested
       into the corner. Subtle by default, fully opaque on hover. -->
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    class="absolute bottom-0.5 right-0.5 text-icon-secondary transition-colors group-hover:text-text"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  >
    <path d="M13 4 L4 13" />
    <path d="M13 8 L8 13" />
    <path d="M13 12 L12 13" />
  </svg>
</div>
