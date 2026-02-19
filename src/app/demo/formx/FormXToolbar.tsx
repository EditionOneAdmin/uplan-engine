"use client";

import React from 'react';
import type { ToolType } from './types';
import {
  MousePointer2, Square, Undo2, Redo2, Grid3X3, Magnet, Maximize,
  Pentagon,
} from 'lucide-react';

interface Props {
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;
  gridVisible: boolean;
  onToggleGrid: () => void;
  snapEnabled: boolean;
  onToggleSnap: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onZoomFit: () => void;
}

const LShapeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 2h5v8h7v5H3z" />
  </svg>
);

const UShapeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 2h4v10h4V2h4v14H3z" />
  </svg>
);

interface ToolBtnProps {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  disabled?: boolean;
}

function ToolBtn({ active, onClick, title, children, disabled }: ToolBtnProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
        active
          ? 'bg-teal-600 text-white'
          : disabled
          ? 'text-white/20 cursor-not-allowed'
          : 'text-white/60 hover:text-white hover:bg-white/10'
      }`}
    >
      {children}
    </button>
  );
}

export default function FormXToolbar({
  activeTool, onToolChange, gridVisible, onToggleGrid,
  snapEnabled, onToggleSnap, onUndo, onRedo, canUndo, canRedo, onZoomFit,
}: Props) {
  return (
    <div className="w-[60px] bg-gray-900 border-r border-white/10 flex flex-col items-center py-3 gap-1 shrink-0">
      <ToolBtn active={activeTool === 'select'} onClick={() => onToolChange('select')} title="Auswahl (V)">
        <MousePointer2 size={18} />
      </ToolBtn>
      <ToolBtn active={activeTool === 'rect'} onClick={() => onToolChange('rect')} title="Rechteck (R)">
        <Square size={18} />
      </ToolBtn>
      <ToolBtn active={activeTool === 'lshape'} onClick={() => onToolChange('lshape')} title="L-Form (L)">
        <LShapeIcon />
      </ToolBtn>
      <ToolBtn active={activeTool === 'ushape'} onClick={() => onToolChange('ushape')} title="U-Form (U)">
        <UShapeIcon />
      </ToolBtn>
      <ToolBtn active={activeTool === 'polygon'} onClick={() => onToolChange('polygon')} title="Polygon (P)">
        <Pentagon size={18} />
      </ToolBtn>

      <div className="w-8 h-px bg-white/10 my-2" />

      <ToolBtn active={false} onClick={onUndo} title="Rückgängig (Ctrl+Z)" disabled={!canUndo}>
        <Undo2 size={18} />
      </ToolBtn>
      <ToolBtn active={false} onClick={onRedo} title="Wiederholen (Ctrl+Shift+Z)" disabled={!canRedo}>
        <Redo2 size={18} />
      </ToolBtn>

      <div className="w-8 h-px bg-white/10 my-2" />

      <ToolBtn active={gridVisible} onClick={onToggleGrid} title="Grid (G)">
        <Grid3X3 size={18} />
      </ToolBtn>
      <ToolBtn active={snapEnabled} onClick={onToggleSnap} title="Snap (S)">
        <Magnet size={18} />
      </ToolBtn>
      <ToolBtn active={false} onClick={onZoomFit} title="Zoom Fit (F)">
        <Maximize size={18} />
      </ToolBtn>
    </div>
  );
}
