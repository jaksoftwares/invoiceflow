import Icon from '@/components/ui/AppIcon';

interface QuickActionButtonProps {
  label: string;
  icon: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'accent';
}

const QuickActionButton = ({ label, icon, onClick, variant = 'primary' }: QuickActionButtonProps) => {
  const variantStyles = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
    accent: 'bg-accent text-accent-foreground hover:bg-accent/90'
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-6 py-4 rounded-lg font-medium transition-smooth hover:-translate-y-[1px] hover:shadow-elevation-2 active:scale-[0.97] ${variantStyles[variant]}`}
    >
      <Icon name={icon as any} size={24} />
      <span>{label}</span>
    </button>
  );
};

export default QuickActionButton;