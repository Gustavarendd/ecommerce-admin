'use client';

import { useEffect } from 'react';

import { useModalStore } from '@/hooks/use-store-modal';

const SetupPage = () => {
  const [onOpen, isOpen] = useModalStore(state => [state.onOpen, state.isOpen]);

  useEffect(() => {
    if (!isOpen) {
      onOpen();
    }
  }, [isOpen, onOpen]);

  return null;
};

export default SetupPage;
