"use client";

import { useEffect, useState } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts";

interface DriftPoint {
  batch: string;
  dir: number;
}

interface FairnessDriftChartProps {
  currentDir: number | null;
  isFairModel: boolean;
  historyTrigger: number;
}

export default function FairnessDriftChart({ currentDir, isFairModel, historyTrigger }: FairnessDriftChartProps) {
  const [data, setData] = useState<DriftPoint[]>(() => 
    Array.from({ length: 15 }).map((_, i) => ({
      batch: `Batch ${i + 1}`,
      dir: Number((0.85 - (i * 0.02) + (Math.random() * 0.05)).toFixed(2)),
    }))
  );

  // Update chart when a new prediction happens
  useEffect(() => {
    if (currentDir !== null && historyTrigger > 0) {
      requestAnimationFrame(() => {
        setData((prev) => {
          const newData = [...prev.slice(1), {
            batch: `Pred #${historyTrigger}`,
            dir: Number(currentDir.toFixed(2)),
          }];
          return newData;
        });
      });
    }
  }, [currentDir, historyTrigger]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorDir" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isFairModel ? "var(--success)" : "var(--accent)"} stopOpacity={0.1}/>
                <stop offset="95%" stopColor={isFairModel ? "var(--success)" : "var(--accent)"} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis 
              dataKey="batch" 
              stroke="rgba(255,255,255,0.3)" 
              fontSize={9} 
              tickLine={false} 
              axisLine={false}
              dy={10}
            />
            <YAxis 
              domain={[0, 1.1]} 
              stroke="rgba(255,255,255,0.3)" 
              fontSize={9} 
              tickLine={false} 
              axisLine={false}
              dx={-5}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: '#0f172a', 
                border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '12px',
                fontSize: '10px'
              }}
              itemStyle={{ color: '#fff' }}
            />
            <ReferenceLine 
                y={0.8} 
                stroke="var(--danger)" 
                strokeDasharray="5 5" 
                strokeOpacity={0.5}
                label={{ position: 'right', value: '80% REGULATORY FLOOR', fill: 'var(--danger)', fontSize: 8, fontWeight: 'bold' }} 
            />
            <Area
              type="monotone"
              dataKey="dir"
              stroke={isFairModel ? "var(--success)" : "var(--accent)"}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorDir)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

