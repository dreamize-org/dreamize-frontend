'use client';

import { useState } from 'react';
import { commaListsMatch, formatCommaList, parseCommaList } from '@/lib/forms/commaList';

interface CommaSeparatedInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: string[];
  onChange: (value: string[]) => void;
}

export function CommaSeparatedInput({
  value,
  onChange,
  className,
  ...props
}: CommaSeparatedInputProps) {
  const serializedValue = formatCommaList(value);
  const [text, setText] = useState(serializedValue);
  const [lastSerializedValue, setLastSerializedValue] = useState(serializedValue);

  if (serializedValue !== lastSerializedValue) {
    setLastSerializedValue(serializedValue);
    if (!commaListsMatch(text, value)) {
      setText(serializedValue);
    }
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextText = event.target.value;
    setText(nextText);
    onChange(parseCommaList(nextText));
  };

  return (
    <input
      {...props}
      type="text"
      value={text}
      onChange={handleChange}
      className={className}
    />
  );
}
