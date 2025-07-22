'use client';

import { useState } from 'react';
import { useMonitors } from '@/hooks/useMonitors';
import { Monitor, CreateMonitor, UpdateMonitor } from '@/types/shared';
import { MonitorCard } from './monitor-card';
import { CreateMonitorDialog } from './create-monitor-dialog';
import { EditMonitorDialog } from './edit-monitor-dialog';
import { ManageAlertsDialog } from './manage-alerts-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Plus, 
  Search, 
  RefreshCw,
  AlertCircle,
  Loader2
} from 'lucide-react';

export function MonitorsList() {
  const {
    monitors,
    loading,
    error,
    pagination,
    fetchMonitors,
    createMonitor,
    updateMonitor,
    deleteMonitor,
    toggleMonitor,
    refetch,
  } = useMonitors();

  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAlertsDialog, setShowAlertsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedMonitor, setSelectedMonitor] = useState<Monitor | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter monitors based on search query
  const filteredMonitors = monitors.filter(monitor =>
    monitor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    monitor.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateMonitor = async (data: CreateMonitor) => {
    await createMonitor(data);
    setShowCreateDialog(false);
  };

  const handleEditMonitor = (monitor: Monitor) => {
    setSelectedMonitor(monitor);
    setShowEditDialog(true);
  };

  const handleUpdateMonitor = async (data: UpdateMonitor) => {
    if (selectedMonitor) {
      await updateMonitor(selectedMonitor.id, data);
      setShowEditDialog(false);
      setSelectedMonitor(null);
    }
  };

  const handleDeleteMonitor = (monitor: Monitor) => {
    setSelectedMonitor(monitor);
    setShowDeleteDialog(true);
  };

  const confirmDeleteMonitor = async () => {
    if (selectedMonitor) {
      await deleteMonitor(selectedMonitor.id);
      setShowDeleteDialog(false);
      setSelectedMonitor(null);
    }
  };

  const handleToggleMonitor = async (monitor: Monitor) => {
    await toggleMonitor(monitor.id);
  };

  const handleManageAlerts = (monitor: Monitor) => {
    setSelectedMonitor(monitor);
    setShowAlertsDialog(true);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading monitors...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <div>
            <h3 className="text-lg font-semibold">Failed to load monitors</h3>
            <p className="text-muted-foreground">{error}</p>
          </div>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monitors</h1>
          <p className="text-muted-foreground">
            Monitor your websites and APIs for uptime and performance
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Monitor
        </Button>
      </div>

      {/* Search and Actions */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search monitors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Monitors Grid */}
      {filteredMonitors.length === 0 ? (
        <div className="text-center py-12">
          <div className="space-y-4">
            <div className="mx-auto h-24 w-24 bg-muted rounded-full flex items-center justify-center">
              <Plus className="h-12 w-12 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No monitors found</h3>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? `No monitors match "${searchQuery}"`
                  : 'Get started by creating your first monitor'
                }
              </p>
            </div>
            {!searchQuery && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Monitor
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {filteredMonitors.map((monitor) => (
            <MonitorCard
              key={monitor.id}
              monitor={monitor}
              onEdit={handleEditMonitor}
              onDelete={handleDeleteMonitor}
              onToggle={handleToggleMonitor}
              onManageAlerts={handleManageAlerts}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            disabled={pagination.page <= 1}
            onClick={() => fetchMonitors(pagination.page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => fetchMonitors(pagination.page + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Dialogs */}
      <CreateMonitorDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateMonitor}
      />

      <EditMonitorDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSubmit={handleUpdateMonitor}
        monitor={selectedMonitor}
      />

      {selectedMonitor && (
        <ManageAlertsDialog
          open={showAlertsDialog}
          onOpenChange={setShowAlertsDialog}
          monitor={selectedMonitor}
        />
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Monitor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedMonitor?.name}"? This action cannot be undone.
              All monitoring data and incidents will be preserved but the monitor will be deactivated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteMonitor}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Monitor
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}