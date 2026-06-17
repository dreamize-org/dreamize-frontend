'use client';

import { useEffect, useState } from 'react';
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
  const [text, setText] = useState(() => formatCommaList(value));
  const valueKey = value.join('\u0000');

  useEffect(() => {
    setText((current) => {
      if (commaListsMatch(current, value)) {
        return current;
      }
      return formatCommaList(value);
    });
  }, [valueKey]);

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
