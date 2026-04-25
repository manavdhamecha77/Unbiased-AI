"use client";

import { ReactFlow, Controls, Background, Edge, Node, MarkerType } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

interface DagModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string;
}

const initialNodes: Node[] = [
  { id: 'age', position: { x: 250, y: 50 }, data: { label: 'Age' }, style: { backgroundColor: '#1e293b', color: 'white', border: '1px solid #64748b' } },
  { id: 'education', position: { x: 450, y: 50 }, data: { label: 'Education' }, style: { backgroundColor: '#1e293b', color: 'white', border: '1px solid #64748b' } },
  { id: 'sex', position: { x: 50, y: 150 }, data: { label: 'Sex (Sensitive)' }, style: { border: '2px solid #ef4444', backgroundColor: '#450a0a', color: '#fca5a5' } },
  { id: 'race', position: { x: 50, y: 250 }, data: { label: 'Race (Sensitive)' }, style: { border: '2px solid #ef4444', backgroundColor: '#450a0a', color: '#fca5a5' } },
  { id: 'occupation', position: { x: 450, y: 150 }, data: { label: 'Occupation' }, style: { backgroundColor: '#1e293b', color: 'white', border: '1px solid #64748b' } },
  { id: 'marital', position: { x: 250, y: 200 }, data: { label: 'Marital Status' }, style: { backgroundColor: '#1e293b', color: 'white', border: '1px solid #64748b' } },
  { id: 'hours', position: { x: 450, y: 250 }, data: { label: 'Hours/Week' }, style: { backgroundColor: '#1e293b', color: 'white', border: '1px solid #64748b' } },
  { id: 'income', position: { x: 700, y: 150 }, data: { label: 'Income (Outcome)' }, style: { border: '2px solid #3b82f6', backgroundColor: '#1e3a8a', color: '#93c5fd' } },
];

const edgeDefault = { type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } };
const sensitiveEdge = { ...edgeDefault, animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } };

const initialEdges: Edge[] = [
  { id: 'e-age-edu', source: 'age', target: 'education', ...edgeDefault },
  { id: 'e-age-occ', source: 'age', target: 'occupation', ...edgeDefault },
  { id: 'e-age-inc', source: 'age', target: 'income', ...edgeDefault },
  { id: 'e-edu-occ', source: 'education', target: 'occupation', ...edgeDefault },
  { id: 'e-edu-inc', source: 'education', target: 'income', ...edgeDefault },
  { id: 'e-sex-occ', source: 'sex', target: 'occupation', ...sensitiveEdge },
  { id: 'e-sex-hrs', source: 'sex', target: 'hours', ...sensitiveEdge },
  { id: 'e-sex-inc', source: 'sex', target: 'income', ...sensitiveEdge },
  { id: 'e-race-edu', source: 'race', target: 'education', ...sensitiveEdge },
  { id: 'e-race-occ', source: 'race', target: 'occupation', ...sensitiveEdge },
  { id: 'e-race-inc', source: 'race', target: 'income', ...sensitiveEdge },
  { id: 'e-occ-inc', source: 'occupation', target: 'income', ...edgeDefault },
  { id: 'e-hrs-inc', source: 'hours', target: 'income', ...edgeDefault },
  { id: 'e-mar-inc', source: 'marital', target: 'income', ...edgeDefault },
  { id: 'e-mar-hrs', source: 'marital', target: 'hours', ...edgeDefault },
];

export default function DagModal({ isOpen, onClose }: DagModalProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-4 md:inset-12 z-50 flex flex-col glass-card animate-fade-in overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-card-border">
          <div>
            <h2 className="text-base font-semibold text-foreground">Interactive Causal DAG</h2>
            <p className="text-xs text-muted mt-0.5">Sensitive attribute pathways to income prediction</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 transition-colors text-muted hover:text-foreground cursor-pointer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="flex-1 w-full h-full relative" style={{ minHeight: '400px' }}>
          <ReactFlow 
            nodes={initialNodes} 
            edges={initialEdges}
            fitView
            colorMode="dark"
          >
            <Background color="#334155" gap={16} />
            <Controls />
          </ReactFlow>
        </div>
        <div className="px-6 py-3 border-t border-card-border flex gap-6 text-xs text-muted">
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-red-500 inline-block" /> Sensitive attribute path</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-slate-500 inline-block" /> Normal causal path</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" /> Outcome variable</span>
        </div>
      </div>
    </>
  );
}
