'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { AlertRecipient } from '@/types/shared';
import { toast } from 'sonner';

export function useAlertRecipients(monitorId: string) {
  const [recipients, setRecipients] = useState<AlertRecipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipients = useCallback(async () => {
    if (!monitorId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.getAlertRecipients(monitorId);
      
      if (response.success && response.data) {
        setRecipients(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch alert recipients');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch alert recipients';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [monitorId]);

  const addRecipient = useCallback(async (email: string) => {
    try {
      const response = await apiClient.addAlertRecipient(monitorId, { email });
      
      if (response.success && response.data) {
        setRecipients(prev => [...prev, response.data!]);
        toast.success('Alert recipient added successfully');
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to add alert recipient');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add alert recipient';
      toast.error(errorMessage);
      throw err;
    }
  }, [monitorId]);

  const removeRecipient = useCallback(async (recipientId: string) => {
    try {
      const response = await apiClient.removeAlertRecipient(monitorId, recipientId);
      
      if (response.success) {
        setRecipients(prev => prev.filter(r => r.id !== recipientId));
        toast.success('Alert recipient removed successfully');
      } else {
        throw new Error(response.error || 'Failed to remove alert recipient');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove alert recipient';
      toast.error(errorMessage);
      throw err;
    }
  }, [monitorId]);

  const toggleRecipient = useCallback(async (recipientId: string) => {
    try {
      const response = await apiClient.toggleAlertRecipient(monitorId, recipientId);
      
      if (response.success && response.data) {
        setRecipients(prev => 
          prev.map(r => 
            r.id === recipientId ? response.data! : r
          )
        );
        const status = response.data.isActive ? 'activated' : 'deactivated';
        toast.success(`Alert recipient ${status} successfully`);
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to toggle alert recipient');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle alert recipient';
      toast.error(errorMessage);
      throw err;
    }
  }, [monitorId]);

  useEffect(() => {
    fetchRecipients();
  }, [fetchRecipients]);

  return {
    recipients,
    loading,
    error,
    fetchRecipients,
    addRecipient,
    removeRecipient,
    toggleRecipient,
    refetch: fetchRecipients,
  };
}