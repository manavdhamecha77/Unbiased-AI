"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
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
  const [data, setData] = useState<DriftPoint[]>([]);

  // Initialize with some mock drift data showing degradation
  useEffect(() => {
    const initialData: DriftPoint[] = Array.from({ length: 10 }).map((_, i) => ({
      batch: `T-${10 - i}`,
      dir: Number((0.85 - (i * 0.05) + (Math.random() * 0.05)).toFixed(2)),
    }));
    setData(initialData);
  }, []);

  // Update chart when a new prediction happens
  useEffect(() => {
    if (currentDir !== null && historyTrigger > 0) {
      setData((prev) => {
        const newData = [...prev.slice(1), {
          batch: `Pred #${historyTrigger}`,
          dir: Number(currentDir.toFixed(2)),
        }];
        return newData;
      });
    }
  }, [currentDir, historyTrigger]);

  return (
    <div className="glass-card p-6 w-full h-[350px] flex flex-col">
      <div>
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
          Model Drift & Fairness Monitor
        </h3>
        <p className="text-xs text-muted mt-1">Tracking Disparate Impact Ratio (DIR) over time. Red line indicates the 80% rule threshold.</p>
      </div>

      <div className="flex-1 w-full mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 15, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" vertical={false} />
            <XAxis dataKey="batch" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis domain={[0, 1.2]} stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid var(--card-border)', borderRadius: '8px' }}
              itemStyle={{ color: '#fff', fontSize: '12px' }}
            />
            <ReferenceLine y={0.8} stroke="var(--danger)" strokeDasharray="3 3" label={{ position: 'top', value: '80% Threshold', fill: 'var(--danger)', fontSize: 10 }} />
            <Line
              type="monotone"
              dataKey="dir"
              stroke={isFairModel ? "var(--success)" : "var(--accent)"}
              strokeWidth={3}
              dot={{ r: 4, fill: isFairModel ? "var(--success)" : "var(--accent)", strokeWidth: 0 }}
              activeDot={{ r: 6 }}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
