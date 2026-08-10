import React, { useEffect, useRef } from 'react';

interface TicketQRProps {
  data: string;
  size?: number;
}

export const TicketQR: React.FC<TicketQRProps> = ({ data, size = 160 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, size, size);

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // Deterministic pseudo-random matrix based on input string hash
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = (hash << 5) - hash + data.charCodeAt(i);
      hash |= 0;
    }

    const gridSize = 21;
    const cellSize = size / gridSize;

    ctx.fillStyle = '#0f172a'; // Deep slate black

    // Generate matrix modules
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        // Skip position detection patterns (top-left, top-right, bottom-left)
        if (
          (r < 7 && c < 7) ||
          (r < 7 && c >= gridSize - 7) ||
          (r >= gridSize - 7 && c < 7)
        ) {
          continue;
        }

        const isBitSet = Math.abs((hash ^ (r * 31 + c * 17)) % 3) === 0;
        if (isBitSet) {
          ctx.fillRect(c * cellSize + 0.5, r * cellSize + 0.5, cellSize - 1, cellSize - 1);
        }
      }
    }

    // Function to draw QR Position Detection Pattern (Eye)
    const drawEye = (x: number, y: number) => {
      // Outer 7x7 square
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x * cellSize, y * cellSize, 7 * cellSize, 7 * cellSize);
      // Inner 5x5 white square
      ctx.fillStyle = '#ffffff';
      ctx.fillRect((x + 1) * cellSize, (y + 1) * cellSize, 5 * cellSize, 5 * cellSize);
      // Center 3x3 square
      ctx.fillStyle = '#e11d48'; // Rose accent
      ctx.fillRect((x + 2) * cellSize, (y + 2) * cellSize, 3 * cellSize, 3 * cellSize);
    };

    drawEye(0, 0);
    drawEye(gridSize - 7, 0);
    drawEye(0, gridSize - 7);

    // Draw central BYD brand icon box
    const centerStart = Math.floor(gridSize / 2) - 2;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(centerStart * cellSize, centerStart * cellSize, 5 * cellSize, 5 * cellSize);
    ctx.fillStyle = '#e11d48';
    ctx.fillRect((centerStart + 1) * cellSize, (centerStart + 1) * cellSize, 3 * cellSize, 3 * cellSize);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('B', size / 2, size / 2);
  }, [data, size]);

  return (
    <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xl flex flex-col items-center gap-2">
      <canvas ref={canvasRef} width={size} height={size} className="rounded-lg" />
      <span className="text-[10px] font-mono tracking-wider font-bold text-slate-800 uppercase">
        {data}
      </span>
    </div>
  );
};
