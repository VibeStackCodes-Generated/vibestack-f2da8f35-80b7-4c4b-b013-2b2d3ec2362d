import { useState, useCallback, useEffect } from 'react';
import { Display } from './Display';
import { CalcButton } from './CalcButton';

type AngleMode = 'DEG' | 'RAD';

export function Calculator() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [memory, setMemory] = useState(0);
  const [angleMode, setAngleMode] = useState<AngleMode>('DEG');
  const [isSecond, setIsSecond] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [history, setHistory] = useState<{ expr: string; result: string }[]>([]);

  const toRad = (val: number) => angleMode === 'DEG' ? (val * Math.PI) / 180 : val;
  const fromRad = (val: number) => angleMode === 'DEG' ? (val * 180) / Math.PI : val;

  const safeEval = (expr: string): number => {
    try {
      const sanitized = expr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, String(Math.PI))
        .replace(/e(?![x])/g, String(Math.E));
      const fn = new Function('return ' + sanitized);
      const result = fn();
      if (typeof result === 'number' && isFinite(result)) return result;
      return NaN;
    } catch {
      return NaN;
    }
  };

  const appendToDisplay = useCallback((value: string) => {
    setDisplay(prev => {
      if (lastResult !== null) {
        setLastResult(null);
        if (['+', '-', '×', '÷', '^'].includes(value)) {
          return prev + value;
        }
        return value === '.' ? '0.' : value;
      }
      if (prev === '0' && value !== '.' && !['+', '-', '×', '÷', '^'].includes(value)) {
        return value;
      }
      return prev + value;
    });
  }, [lastResult]);

  const applyFunction = useCallback((fn: string) => {
    setDisplay(prev => {
      const num = parseFloat(prev) || safeEval(prev);
      if (isNaN(num)) return 'Error';
      let result: number;
      switch (fn) {
        case 'sin': result = Math.sin(toRad(num)); break;
        case 'cos': result = Math.cos(toRad(num)); break;
        case 'tan': result = Math.tan(toRad(num)); break;
        case 'asin': result = fromRad(Math.asin(num)); break;
        case 'acos': result = fromRad(Math.acos(num)); break;
        case 'atan': result = fromRad(Math.atan(num)); break;
        case 'ln': result = Math.log(num); break;
        case 'log': result = Math.log10(num); break;
        case 'sqrt': result = Math.sqrt(num); break;
        case 'cbrt': result = Math.cbrt(num); break;
        case 'abs': result = Math.abs(num); break;
        case 'fact': result = factorial(Math.floor(num)); break;
        case '1/x': result = 1 / num; break;
        case 'x2': result = num * num; break;
        case 'x3': result = num * num * num; break;
        case '10x': result = Math.pow(10, num); break;
        case 'ex': result = Math.exp(num); break;
        case '2x': result = Math.pow(2, num); break;
        case 'negate': result = -num; break;
        case 'percent': result = num / 100; break;
        default: result = num;
      }
      if (!isFinite(result) || isNaN(result)) return 'Error';
      const formatted = formatNumber(result);
      setExpression(`${fn}(${formatNumber(num)})`);
      setLastResult(formatted);
      setHistory(h => [{ expr: `${fn}(${formatNumber(num)})`, result: formatted }, ...h].slice(0, 20));
      return formatted;
    });
  }, [angleMode, isSecond]);

  const factorial = (n: number): number => {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    if (n > 170) return Infinity;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
  };

  const formatNumber = (num: number): string => {
    if (Number.isInteger(num) && Math.abs(num) < 1e15) return num.toString();
    const str = num.toPrecision(10);
    return parseFloat(str).toString();
  };

  const calculate = useCallback(() => {
    const expr = display;
    const result = safeEval(expr);
    if (isNaN(result)) {
      setExpression(expr);
      setDisplay('Error');
      setLastResult('Error');
    } else {
      const formatted = formatNumber(result);
      setExpression(expr + ' =');
      setDisplay(formatted);
      setLastResult(formatted);
      setHistory(h => [{ expr: expr + ' =', result: formatted }, ...h].slice(0, 20));
    }
  }, [display]);

  const clear = useCallback(() => {
    setDisplay('0');
    setExpression('');
    setLastResult(null);
  }, []);

  const backspace = useCallback(() => {
    setDisplay(prev => {
      if (lastResult !== null) return '0';
      if (prev.length <= 1) return '0';
      return prev.slice(0, -1);
    });
    setLastResult(null);
  }, [lastResult]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      if (key >= '0' && key <= '9') appendToDisplay(key);
      else if (key === '.') appendToDisplay('.');
      else if (key === '+') appendToDisplay('+');
      else if (key === '-') appendToDisplay('-');
      else if (key === '*') appendToDisplay('×');
      else if (key === '/') { e.preventDefault(); appendToDisplay('÷'); }
      else if (key === 'Enter' || key === '=') calculate();
      else if (key === 'Backspace') backspace();
      else if (key === 'Escape') clear();
      else if (key === '(' || key === ')') appendToDisplay(key);
      else if (key === '^') appendToDisplay('^');
      else if (key === '%') applyFunction('percent');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [appendToDisplay, calculate, backspace, clear, applyFunction]);

  const sciButtons = isSecond ? [
    { label: 'sin⁻¹', action: () => applyFunction('asin'), variant: 'scientific' as const },
    { label: 'cos⁻¹', action: () => applyFunction('acos'), variant: 'scientific' as const },
    { label: 'tan⁻¹', action: () => applyFunction('atan'), variant: 'scientific' as const },
    { label: 'eˣ', action: () => applyFunction('ex'), variant: 'scientific' as const },
    { label: '10ˣ', action: () => applyFunction('10x'), variant: 'scientific' as const },
    { label: 'x³', action: () => applyFunction('x3'), variant: 'scientific' as const },
    { label: '³√x', action: () => applyFunction('cbrt'), variant: 'scientific' as const },
    { label: '2ˣ', action: () => applyFunction('2x'), variant: 'scientific' as const },
  ] : [
    { label: 'sin', action: () => applyFunction('sin'), variant: 'scientific' as const },
    { label: 'cos', action: () => applyFunction('cos'), variant: 'scientific' as const },
    { label: 'tan', action: () => applyFunction('tan'), variant: 'scientific' as const },
    { label: 'ln', action: () => applyFunction('ln'), variant: 'scientific' as const },
    { label: 'log', action: () => applyFunction('log'), variant: 'scientific' as const },
    { label: 'x²', action: () => applyFunction('x2'), variant: 'scientific' as const },
    { label: '√x', action: () => applyFunction('sqrt'), variant: 'scientific' as const },
    { label: 'x!', action: () => applyFunction('fact'), variant: 'scientific' as const },
  ];

  const topRow = [
    { label: '2nd', action: () => setIsSecond(s => !s), variant: (isSecond ? 'second-active' : 'function') as const },
    { label: angleMode, action: () => setAngleMode(m => m === 'DEG' ? 'RAD' : 'DEG'), variant: 'function' as const },
    { label: 'π', action: () => appendToDisplay('π'), variant: 'function' as const },
    { label: 'e', action: () => appendToDisplay('e'), variant: 'function' as const },
    { label: '1/x', action: () => applyFunction('1/x'), variant: 'scientific' as const },
    { label: '|x|', action: () => applyFunction('abs'), variant: 'scientific' as const },
  ];

  const mainButtons = [
    { label: 'AC', action: clear, variant: 'function' as const },
    { label: '(', action: () => appendToDisplay('('), variant: 'function' as const },
    { label: ')', action: () => appendToDisplay(')'), variant: 'function' as const },
    { label: '÷', action: () => appendToDisplay('÷'), variant: 'operator' as const },

    { label: '7', action: () => appendToDisplay('7'), variant: 'number' as const },
    { label: '8', action: () => appendToDisplay('8'), variant: 'number' as const },
    { label: '9', action: () => appendToDisplay('9'), variant: 'number' as const },
    { label: '×', action: () => appendToDisplay('×'), variant: 'operator' as const },

    { label: '4', action: () => appendToDisplay('4'), variant: 'number' as const },
    { label: '5', action: () => appendToDisplay('5'), variant: 'number' as const },
    { label: '6', action: () => appendToDisplay('6'), variant: 'number' as const },
    { label: '-', action: () => appendToDisplay('-'), variant: 'operator' as const },

    { label: '1', action: () => appendToDisplay('1'), variant: 'number' as const },
    { label: '2', action: () => appendToDisplay('2'), variant: 'number' as const },
    { label: '3', action: () => appendToDisplay('3'), variant: 'number' as const },
    { label: '+', action: () => appendToDisplay('+'), variant: 'operator' as const },

    { label: '±', action: () => applyFunction('negate'), variant: 'number' as const },
    { label: '0', action: () => appendToDisplay('0'), variant: 'number' as const },
    { label: '.', action: () => appendToDisplay('.'), variant: 'number' as const },
    { label: '=', action: calculate, variant: 'equals' as const },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-2xl shadow-black/50 overflow-hidden border border-border">
          <Display value={display} expression={expression} />

          <div className="p-3 space-y-2">
            {/* Top utility row */}
            <div className="grid grid-cols-6 gap-1.5">
              {topRow.map(btn => (
                <CalcButton key={btn.label} {...btn} size="sm" />
              ))}
            </div>

            {/* Scientific functions */}
            <div className="grid grid-cols-4 gap-1.5">
              {sciButtons.map(btn => (
                <CalcButton key={btn.label} {...btn} size="sm" />
              ))}
            </div>

            <div className="h-px bg-border/50 my-1" />

            {/* Main calculator grid */}
            <div className="grid grid-cols-4 gap-1.5">
              {mainButtons.map(btn => (
                <CalcButton key={btn.label} {...btn} />
              ))}
            </div>

            {/* Backspace row */}
            <div className="grid grid-cols-4 gap-1.5">
              <CalcButton label="MC" action={() => setMemory(0)} variant="function" size="sm" />
              <CalcButton label="MR" action={() => { setDisplay(formatNumber(memory)); setLastResult(formatNumber(memory)); }} variant="function" size="sm" />
              <CalcButton label="M+" action={() => setMemory(m => m + (parseFloat(display) || 0))} variant="function" size="sm" />
              <CalcButton label="⌫" action={backspace} variant="function" size="sm" />
            </div>
          </div>
        </div>

        <p className="text-center text-muted-foreground text-xs mt-4 opacity-60">
          Keyboard supported · Press keys to calculate
        </p>
      </div>
    </div>
  );
}
