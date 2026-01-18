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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-card rounded-lg shadow-elevation-3 border border-border p-4 min-w-[400px]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Icon name="CheckCircleIcon" size={20} className="text-primary" />
              <span className="text-sm font-medium text-foreground">
                {selectedCount} invoice{selectedCount !== 1 ? 's' : ''} selected
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onMarkPaid}
              className="flex items-center gap-2 px-3 py-2 bg-success text-success-foreground rounded-md text-sm font-medium hover:bg-success/90 transition-smooth"
            >
              <Icon name="CheckCircleIcon" size={16} />
              <span>Mark Paid</span>
            </button>

            <button
              onClick={onSendReminders}
              className="flex items-center gap-2 px-3 py-2 bg-accent text-accent-foreground rounded-md text-sm font-medium hover:bg-accent/90 transition-smooth"
            >
              <Icon name="PaperAirplaneIcon" size={16} />
              <span>Send Reminders</span>
            </button>

            <button
              onClick={onExportPDF}
              className="flex items-center gap-2 px-3 py-2 bg-muted text-foreground rounded-md text-sm font-medium hover:bg-muted/80 transition-smooth"
            >
              <Icon name="ArrowDownTrayIcon" size={16} />
              <span>Export PDF</span>
            </button>

            <div className="h-6 w-px bg-border" />

            <button
              onClick={onDelete}
              className="flex items-center gap-2 px-3 py-2 bg-error text-error-foreground rounded-md text-sm font-medium hover:bg-error/90 transition-smooth"
            >
              <Icon name="TrashIcon" size={16} />
              <span>Delete</span>
            </button>

            <button
              onClick={onClearSelection}
              className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground rounded-md text-sm font-medium transition-smooth"
            >
              <Icon name="XMarkIcon" size={16} />
              <span>Clear</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkActionToolbar;