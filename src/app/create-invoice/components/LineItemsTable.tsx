'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface LineItemsTableProps {
  items: LineItem[];
  onItemsChange: (items: LineItem[]) => void;
  currency: string;
}

const LineItemsTable = ({ items, onItemsChange, currency }: LineItemsTableProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  const addNewItem = () => {
    const newItem: LineItem = {
      id: `item-${Date.now()}`,
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0,
    };
    onItemsChange([...items, newItem]);
    setEditingId(newItem.id);
  };

  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    const updatedItems = items.map((item) => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          updated.amount = Number(updated.quantity) * Number(updated.rate);
        }
        return updated;
      }
      return item;
    });
    onItemsChange(updatedItems);
  };

  const removeItem = (id: string) => {
    onItemsChange(items.filter((item) => item.id !== id));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-heading font-semibold text-foreground">Line Items</h3>
        <button
          type="button"
          onClick={addNewItem}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-md text-sm font-medium transition-smooth hover:-translate-y-[1px] hover:shadow-elevation-2"
        >
          <Icon name="PlusIcon" size={18} />
          <span>Add Item</span>
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full border border-border rounded-md">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Description</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-foreground w-24">Quantity</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-foreground w-32">Rate</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-foreground w-32">Amount</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-foreground w-20">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((item) => (
                <tr key={item.id} className="border-t border-border hover:bg-muted/50 transition-smooth">
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      placeholder="Service or product description"
                      className="w-full px-3 py-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                      min="1"
                      className="w-full px-3 py-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={item.rate}
                      onChange={(e) => updateItem(item.id, 'rate', Number(e.target.value))}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-foreground data-text">
                      {formatCurrency(item.amount)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-error hover:bg-error/10 rounded-md transition-smooth"
                      title="Remove item"
                    >
                      <Icon name="TrashIcon" size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center">
                  <Icon name="DocumentTextIcon" size={48} className="mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">No items added yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Click "Add Item" to get started</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {items.length > 0 ? (
          items.map((item, index) => (
            <div key={item.id} className="bg-card border border-border rounded-md p-4 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Item #{index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-error hover:bg-error/10 rounded-md transition-smooth"
                >
                  <Icon name="TrashIcon" size={18} />
                </button>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-medium text-foreground">Description</label>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                  placeholder="Service or product description"
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-foreground">Quantity</label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                    min="1"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-foreground">Rate</label>
                  <input
                    type="number"
                    value={item.rate}
                    onChange={(e) => updateItem(item.id, 'rate', Number(e.target.value))}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <div className="pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Amount:</span>
                  <span className="text-lg font-semibold text-foreground data-text">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-card border border-border rounded-md p-12 text-center">
            <Icon name="DocumentTextIcon" size={48} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No items added yet</p>
            <p className="text-xs text-muted-foreground mt-1">Click "Add Item" to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LineItemsTable;