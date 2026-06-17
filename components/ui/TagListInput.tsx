'use client';

import { Plus } from 'lucide-react';
import { mergeUniqueTags, parseCommaList } from '@/lib/forms/commaList';

interface TagListInputProps {
  id: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  hint?: string;
  inputClassName?: string;
  buttonClassName?: string;
}

export function TagListInput({
  id,
  tags,
  onChange,
  placeholder,
  hint = 'Press Enter or comma to add items. Paste comma-separated lists too.',
  inputClassName,
  buttonClassName,
}: TagListInputProps) {
  const addFromInput = (input: HTMLInputElement) => {
    const raw = input.value.trim();
    if (!raw) return;

    const incoming = raw.includes(',') ? parseCommaList(raw) : [raw];
    const next = mergeUniqueTags(tags, incoming);
    if (next.length !== tags.length) {
      onChange(next);
    }
    input.value = '';
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addFromInput(event.currentTarget);
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData('text');
    if (!pasted.includes(',')) return;

    event.preventDefault();
    const incoming = parseCommaList(pasted);
    const next = mergeUniqueTags(tags, incoming);
    if (next.length !== tags.length) {
      onChange(next);
    }
    event.currentTarget.value = '';
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          id={id}
          placeholder={placeholder}
          className={inputClassName}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
        />
        <button
          type="button"
          onClick={() => {
            const input = document.getElementById(id) as HTMLInputElement | null;
            if (input) addFromInput(input);
          }}
          className={buttonClassName}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {hint ? <p className="text-[10px] text-slate-400">{hint}</p> : null}
    </div>
  );
}
