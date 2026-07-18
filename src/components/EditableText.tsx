import React, { useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';

interface EditableTextProps {
  value: string;
  onSave: (newValue: string) => void;
  isEditMode: boolean;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  multiline?: boolean;
}

export default function EditableText({ 
  value, 
  onSave, 
  isEditMode, 
  className = '', 
  as = 'span',
  multiline = false 
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  if (isEditMode) {
    if (isEditing) {
      return (
        <div className="inline-flex flex-col gap-2 w-full max-w-full bg-zinc-900 p-3 rounded-xl border border-zinc-700 shadow-2xl relative z-50 my-1">
          {multiline ? (
            <textarea
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="bg-black text-white border border-zinc-600 px-3 py-2 rounded text-xs font-sans focus:outline-none focus:ring-1 focus:ring-white w-full h-32 resize-y"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <input
              type="text"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="bg-black text-white border border-zinc-600 px-3 py-1.5 rounded text-xs font-sans focus:outline-none focus:ring-1 focus:ring-white w-full"
              autoFocus
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setIsEditing(false);
                  onSave(tempValue);
                } else if (e.key === 'Escape') {
                  setIsEditing(false);
                  setTempValue(value);
                }
              }}
            />
          )}
          <div className="flex justify-end gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => {
                setIsEditing(false);
                setTempValue(value);
              }}
              className="p-1 hover:bg-zinc-800 text-zinc-400 rounded cursor-pointer transition"
              title="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                onSave(tempValue);
              }}
              className="p-1 bg-white text-black hover:bg-zinc-200 rounded cursor-pointer transition flex items-center gap-1 text-[11px] font-bold px-2"
              title="Save changes"
            >
              <Check className="w-3.5 h-3.5" /> Save
            </button>
          </div>
        </div>
      );
    }

    const Tag = as;
    return (
      <Tag
        onClick={(e) => {
          e.stopPropagation();
          setTempValue(value);
          setIsEditing(true);
        }}
        className={`group relative cursor-pointer border border-dashed border-zinc-700/80 hover:border-zinc-300 px-1 py-0.5 rounded transition-all inline-block ${className}`}
        title="Click to edit this text"
      >
        {value}
        <span className="inline-flex items-center gap-0.5 text-[9px] text-zinc-500 font-mono font-normal ml-1.5 border border-zinc-800 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity bg-black shrink-0">
          <Pencil className="w-2.5 h-2.5" /> Edit
        </span>
      </Tag>
    );
  }

  const Tag = as;
  return <Tag className={className}>{value}</Tag>;
}
