import React from 'react';
import { Coffee, Trees, Landmark, ShoppingBag, Sparkles } from 'lucide-react';
import { LocationCategory } from '../types';
import { cn } from '../../../lib/utils';

interface CategoryBadgeProps {
  category: LocationCategory;
  className?: string;
  showIcon?: boolean;
}

export const CATEGORY_CONFIG: Record<
  LocationCategory,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    bg: string;
    text: string;
    border: string;
    dot: string;
    markerColor: string;
  }
> = {
  cafe: {
    label: 'Cafe',
    icon: Coffee,
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    markerColor: '#D97706',
  },
  park: {
    label: 'Park',
    icon: Trees,
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    markerColor: '#059669',
  },
  landmark: {
    label: 'Landmark',
    icon: Landmark,
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    dot: 'bg-indigo-500',
    markerColor: '#4F46E5',
  },
  store: {
    label: 'Store',
    icon: ShoppingBag,
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
    markerColor: '#2563EB',
  },
  service: {
    label: 'Service',
    icon: Sparkles,
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
    markerColor: '#E11D48',
  },
};

export function CategoryBadge({
  category,
  className,
  showIcon = true,
}: CategoryBadgeProps) {
  const config = CATEGORY_CONFIG[category] || {
    label: category,
    icon: Landmark,
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dot: 'bg-slate-500',
    markerColor: '#64748B',
  };

  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border shadow-xs transition-colors',
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3 stroke-[2.2]" />}
      <span>{config.label}</span>
    </span>
  );
}
