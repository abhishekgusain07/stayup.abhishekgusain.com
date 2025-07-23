'use client';

import { useState } from 'react';
import { Monitor } from '@/types/shared';
import { MonitorStatusBadge } from './monitor-status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Power, 
  PowerOff, 
  ExternalLink,
  Mail,
  Clock,
  Globe,
  Eye
} from 'lucide-react';

interface MonitorCardProps {
  monitor: Monitor;
  onEdit?: (monitor: Monitor) => void;
  onDelete?: (monitor: Monitor) => void;
  onToggle?: (monitor: Monitor) => void;
  onManageAlerts?: (monitor: Monitor) => void;
}

export function MonitorCard({ 
  monitor, 
  onEdit, 
  onDelete, 
  onToggle,
  onManageAlerts 
}: MonitorCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    if (!onToggle) return;
    setIsLoading(true);
    try {
      await onToggle(monitor);
    } finally {
      setIsLoading(false);
    }
  };

  const formatLastChecked = (date: Date | null) => {
    if (!date) return 'Never';
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const formatInterval = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex flex-row items-start justify-between w-full">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              {monitor.name}
            </CardTitle>
            <CardDescription className="text-sm break-all">
              {monitor.url}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <MonitorStatusBadge status={monitor.currentStatus} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/monitors/${monitor.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit?.(monitor)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onManageAlerts?.(monitor)}>
                  <Mail className="mr-2 h-4 w-4" />
                  Manage Alerts
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleToggle}
                  disabled={isLoading}
                >
                  {monitor.isActive ? (
                    <>
                      <PowerOff className="mr-2 h-4 w-4" />
                      Disable
                    </>
                  ) : (
                    <>
                      <Power className="mr-2 h-4 w-4" />
                      Enable
                    </>
                  )}
                </DropdownMenuItem>
                {monitor.slug && (
                  <DropdownMenuItem asChild>
                    <a 
                      href={`/status/${monitor.slug}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Status Page
                    </a>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={() => onDelete?.(monitor)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="text-muted-foreground">Method</div>
            <Badge variant="secondary">{monitor.method}</Badge>
          </div>
          
          <div className="space-y-1">
            <div className="text-muted-foreground">Interval</div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatInterval(monitor.interval)}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-muted-foreground">Timeout</div>
            <div>{monitor.timeout}s</div>
          </div>
          
          <div className="space-y-1">
            <div className="text-muted-foreground">Expected Status</div>
            <div className="flex flex-wrap gap-1">
              {Array.isArray(monitor.expectedStatusCodes) 
                ? monitor.expectedStatusCodes.map(code => (
                    <Badge key={code} variant="outline" className="text-xs">
                      {code}
                    </Badge>
                  ))
                : <Badge variant="outline" className="text-xs">200</Badge>
              }
            </div>
          </div>
        </div>

        <div className="pt-2 border-t text-xs text-muted-foreground">
          <div className="flex justify-between items-center">
            <span>Last checked: {formatLastChecked(monitor.lastCheckedAt)}</span>
            {!monitor.isActive && (
              <Badge variant="secondary" className="text-xs">
                Disabled
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}