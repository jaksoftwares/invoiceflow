'use client';

import Icon from '@/components/ui/AppIcon';

interface BulkActionsBarProps {
  selectedCount: number;
  onExport: () => void;
  onSendCommunication: () => void;
  onUpdateStatus: () => void;
  onClearSelection: () => void;
}

const BulkActionsBar = ({
  selectedCount,
  onExport,
  onSendCommunication,
  onUpdateStatus,
  onClearSelection,
}: BulkActionsBarProps) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div className="bg-primary text-primary-foreground rounded-lg shadow-elevation-4 px-6 py-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Icon name="CheckCircleIcon" size={20} />
          <span className="font-medium">{selectedCount} selected</span>
        </div>

        <div className="h-6 w-px bg-primary-foreground/20" />

        <div className="flex items-center gap-2">
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-md text-sm font-medium transition-smooth"
          >
            <Icon name="ArrowDownTrayIcon" size={18} />
            <span>Export</span>
          </button>

          <button
            onClick={onSendCommunication}
            className="flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-md text-sm font-medium transition-smooth"
          >
            <Icon name="PaperAirplaneIcon" size={18} />
            <span>Send Message</span>
          </button>

          <button
            onClick={onUpdateStatus}
            className="flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-md text-sm font-medium transition-smooth"
          >
            <Icon name="PencilSquareIcon" size={18} />
            <span>Update Status</span>
          </button>
        </div>

        <button
          onClick={onClearSelection}
          className="p-2 hover:bg-primary-foreground/10 rounded-md transition-smooth"
          aria-label="Clear selection"
        >
          <Icon name="XMarkIcon" size={20} />
        </button>
      </div>
    </div>
  );
};

export default BulkActionsBar;