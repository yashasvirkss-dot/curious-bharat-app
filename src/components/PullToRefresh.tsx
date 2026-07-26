import React from 'react';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh?: () => Promise<void> | void;
  pullThreshold?: number;
}

export default function PullToRefresh({ children }: PullToRefreshProps) {
  return <>{children}</>;
}

