'use client';

import AppRouterCacheProvider from '@mui/material-nextjs/v13-appRouter/appRouterV13';
import React from 'react';

export const AppWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <AppRouterCacheProvider>{children}</AppRouterCacheProvider>;
};
