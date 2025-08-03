"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { Monitor, CreateMonitor, UpdateMonitor } from "@/types/shared";
import { toast } from "sonner";

export function useMonitors() {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchMonitors = useCallback(async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.getMonitors(page, limit);

      if (response.success && response.data) {
        setMonitors(response.data.items);
        setPagination(response.data.pagination);
      } else {
        throw new Error(response.error || "Failed to fetch monitors");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch monitors";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const createMonitor = useCallback(async (data: CreateMonitor) => {
    try {
      const response = await apiClient.createMonitor(data);

      if (response.success && response.data) {
        // Add the new monitor to the list
        setMonitors((prev) => [response.data!, ...prev]);
        toast.success("Monitor created successfully");
        return response.data;
      } else {
        throw new Error(response.error || "Failed to create monitor");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create monitor";
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const updateMonitor = useCallback(async (id: string, data: UpdateMonitor) => {
    try {
      const response = await apiClient.updateMonitor(id, data);

      if (response.success && response.data) {
        // Update the monitor in the list
        setMonitors((prev) =>
          prev.map((monitor) => (monitor.id === id ? response.data! : monitor))
        );
        toast.success("Monitor updated successfully");
        return response.data;
      } else {
        throw new Error(response.error || "Failed to update monitor");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update monitor";
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const deleteMonitor = useCallback(async (id: string) => {
    try {
      const response = await apiClient.deleteMonitor(id);

      if (response.success) {
        // Remove the monitor from the list
        setMonitors((prev) => prev.filter((monitor) => monitor.id !== id));
        toast.success("Monitor deleted successfully");
      } else {
        throw new Error(response.error || "Failed to delete monitor");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete monitor";
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const toggleMonitor = useCallback(async (id: string) => {
    try {
      const response = await apiClient.toggleMonitor(id);

      if (response.success && response.data) {
        // Update the monitor status in the list
        setMonitors((prev) =>
          prev.map((monitor) => (monitor.id === id ? response.data! : monitor))
        );
        const status = response.data.isActive ? "activated" : "deactivated";
        toast.success(`Monitor ${status} successfully`);
        return response.data;
      } else {
        throw new Error(response.error || "Failed to toggle monitor");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to toggle monitor";
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchMonitors();
  }, [fetchMonitors]);

  return {
    monitors,
    loading,
    error,
    pagination,
    fetchMonitors,
    createMonitor,
    updateMonitor,
    deleteMonitor,
    toggleMonitor,
    refetch: () => fetchMonitors(pagination.page, pagination.limit),
  };
}
