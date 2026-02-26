import Icon from '@/components/ui/AppIcon';

interface BulkActionToolbarProps {
  selectedCount: number;
  onMarkPaid: () => void;
  onSendReminders: () => void;
  onExportPDF: () => void;
  onDelete: () => void;
  onClearSelection: () => void;
}

const BulkActionToolbar = ({
  selectedCount,
  onMarkPaid,
  onSendReminders,
  onExportPDF,
  onDelete,
  onClearSelection,
}: BulkActionToolbarProps) => {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-4xl animate-in slide-in-from-bottom-10 duration-500 ease-out">
      <div className="bg-foreground text-background rounded-[2rem] shadow-2xl p-2 pl-6 overflow-hidden border border-white/10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 py-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white shadow-lg">
                <span className="text-xs font-black">{selectedCount}</span>
            </div>
            <div className="hidden sm:block">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Selection Active</p>
                <p className="text-xs font-black uppercase tracking-tight">Records Managed</p>
            </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth p-1">
          <button
            onClick={onMarkPaid}
            className="flex items-center gap-2 px-5 py-3 bg-success text-success-foreground rounded-2xl text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
          >
            <Icon name="CheckBadgeIcon" size={16} />
            <span className="hidden md:inline">Mark as Paid</span>
            <span className="md:hidden">Paid</span>
          </button>

          <button
            onClick={onSendReminders}
            className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
          >
            <Icon name="BellIcon" size={16} />
            <span className="hidden md:inline">Send Batch Reminders</span>
            <span className="md:hidden">Alert</span>
          </button>

          <button
            onClick={onDelete}
            className="flex items-center justify-center w-12 h-12 bg-destructive/10 text-destructive rounded-2xl transition-all hover:bg-destructive hover:text-white active:scale-95"
            title="Purge Selection"
          >
            <Icon name="TrashIcon" size={20} />
          </button>

          <button
            onClick={onClearSelection}
            className="flex items-center justify-center w-12 h-12 bg-white/5 text-white/50 rounded-2xl transition-all hover:bg-white/10 hover:text-white active:scale-95"
            title="Cancel Selection"
          >
            <Icon name="XMarkIcon" size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkActionToolbar;
