import { motion } from 'framer-motion';

type ButtonVariant = 'number' | 'operator' | 'function' | 'scientific' | 'equals' | 'second-active';

interface CalcButtonProps {
  label: string;
  action: () => void;
  variant: ButtonVariant;
  size?: 'sm' | 'md';
}

const variantStyles: Record<ButtonVariant, string> = {
  number: 'bg-secondary hover:bg-secondary/80 text-foreground',
  operator: 'bg-primary hover:bg-primary/85 text-primary-foreground font-bold',
  function: 'bg-muted hover:bg-muted/70 text-muted-foreground',
  scientific: 'bg-accent hover:bg-accent/70 text-accent-foreground text-xs',
  equals: 'bg-primary hover:bg-primary/85 text-primary-foreground font-bold',
  'second-active': 'bg-primary/30 hover:bg-primary/40 text-primary ring-1 ring-primary/50',
};

export function CalcButton({ label, action, variant, size = 'md' }: CalcButtonProps) {
  const heightClass = size === 'sm' ? 'h-10' : 'h-14';

  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      onClick={action}
      className={`
        ${heightClass} rounded-xl flex items-center justify-center
        select-none cursor-pointer transition-colors duration-100
        ${variantStyles[variant]}
        ${size === 'sm' ? 'text-xs' : 'text-lg'}
      `}
    >
      {label}
    </motion.button>
  );
}
