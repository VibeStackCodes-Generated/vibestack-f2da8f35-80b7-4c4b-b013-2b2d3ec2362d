import { useRef, useEffect } from 'react';

interface DisplayProps {
  value: string;
  expression: string;
}

export function Display({ value, expression }: DisplayProps) {
  const valueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (valueRef.current) {
      const el = valueRef.current;
      const len = value.length;
      if (len > 16) el.style.fontSize = '1.5rem';
      else if (len > 12) el.style.fontSize = '2rem';
      else if (len > 8) el.style.fontSize = '2.5rem';
      else el.style.fontSize = '3rem';
    }
  }, [value]);

  return (
    <div className="px-5 pt-8 pb-4 bg-gradient-to-b from-card to-card/80">
      <div className="text-right">
        <div className="text-muted-foreground text-sm h-6 truncate font-light tracking-wide">
          {expression || '\u00A0'}
        </div>
        <div
          ref={valueRef}
          className="text-foreground font-semibold tracking-tight transition-all duration-150 min-h-[3.5rem] flex items-end justify-end break-all leading-tight"
          style={{ fontSize: '3rem' }}
        >
          {value === 'Error' ? (
            <span className="text-destructive">{value}</span>
          ) : (
            value
          )}
        </div>
      </div>
    </div>
  );
}
