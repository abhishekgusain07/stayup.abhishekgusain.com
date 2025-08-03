"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Monitor,
  UpdateMonitor,
  UpdateMonitorSchema,
  DEFAULT_UPDATE_MONITOR,
  HTTP_METHOD,
  HttpMethod,
} from "@/types/shared";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface EditMonitorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UpdateMonitor) => Promise<void>;
  monitor: Monitor | null;
}

export function EditMonitorDialog({
  open,
  onOpenChange,
  onSubmit,
  monitor,
}: EditMonitorDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [statusCodes, setStatusCodes] = useState<number[]>([200]);
  const [newStatusCode, setNewStatusCode] = useState("");
  const [customHeaders, setCustomHeaders] = useState<Record<string, string>>(
    {}
  );
  const [newHeaderKey, setNewHeaderKey] = useState("");
  const [newHeaderValue, setNewHeaderValue] = useState("");

  const form = useForm<UpdateMonitor>({
    resolver: zodResolver(UpdateMonitorSchema),
    defaultValues: DEFAULT_UPDATE_MONITOR,
  });

  // Update form values when monitor changes
  useEffect(() => {
    if (monitor && open) {
      const monitorHeaders = monitor.headers || {};
      const monitorStatusCodes = Array.isArray(monitor.expectedStatusCodes)
        ? monitor.expectedStatusCodes
        : [200];

      form.reset({
        name: monitor.name,
        url: monitor.url,
        method: monitor.method,
        expectedStatusCodes: monitorStatusCodes,
        timeout: monitor.timeout,
        interval: monitor.interval,
        retries: monitor.retries,
        headers:
          Object.keys(monitorHeaders).length > 0 ? monitorHeaders : undefined,
        body: monitor.body || "",
        isActive: monitor.isActive,
      });

      setStatusCodes(monitorStatusCodes);
      setCustomHeaders(monitorHeaders);
    }
  }, [monitor, open, form]);

  const handleSubmit = async (data: UpdateMonitor) => {
    if (!monitor) return;

    setIsLoading(true);
    try {
      const submitData = {
        ...data,
        expectedStatusCodes: statusCodes,
        headers:
          Object.keys(customHeaders).length > 0 ? customHeaders : undefined,
      };
      await onSubmit(submitData);
      handleClose();
    } catch (error) {
      console.error("Failed to update monitor:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setStatusCodes([200]);
    setCustomHeaders({});
    setNewStatusCode("");
    setNewHeaderKey("");
    setNewHeaderValue("");
    onOpenChange(false);
  };

  const addStatusCode = () => {
    const code = parseInt(newStatusCode);
    if (code >= 100 && code <= 599 && !statusCodes.includes(code)) {
      setStatusCodes([...statusCodes, code]);
      setNewStatusCode("");
    }
  };

  const removeStatusCode = (code: number) => {
    if (statusCodes.length > 1) {
      setStatusCodes(statusCodes.filter((c) => c !== code));
    }
  };

  const addHeader = () => {
    if (newHeaderKey && newHeaderValue) {
      setCustomHeaders((prev) => ({
        ...prev,
        [newHeaderKey]: newHeaderValue,
      }));
      setNewHeaderKey("");
      setNewHeaderValue("");
    }
  };

  const removeHeader = (key: string) => {
    setCustomHeaders((prev) => {
      const newHeaders = { ...prev };
      delete newHeaders[key];
      return newHeaders;
    });
  };

  const selectedMethod = form.watch("method");
  const showBodyField =
    selectedMethod !== undefined &&
    (
      [HTTP_METHOD.POST, HTTP_METHOD.PUT, HTTP_METHOD.PATCH] as HttpMethod[]
    ).includes(selectedMethod);

  if (!monitor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Monitor: {monitor.name}</DialogTitle>
          <DialogDescription>
            Update the configuration for this monitor.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Basic Information */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monitor Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="My Website" {...field} />
                    </FormControl>
                    <FormDescription>
                      A descriptive name for your monitor
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com"
                        type="url"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The URL to monitor (must include http:// or https://)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>HTTP Method</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(HTTP_METHOD).map((method) => (
                          <SelectItem key={method} value={method}>
                            {method}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Expected Status Codes */}
            <div className="space-y-2">
              <FormLabel>Expected Status Codes</FormLabel>
              <div className="flex flex-wrap gap-2 mb-2">
                {statusCodes.map((code) => (
                  <Badge key={code} variant="secondary" className="gap-1">
                    {code}
                    {statusCodes.length > 1 && (
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeStatusCode(code)}
                      />
                    )}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="200"
                  value={newStatusCode}
                  onChange={(e) => setNewStatusCode(e.target.value)}
                  className="w-20"
                  type="number"
                  min="100"
                  max="599"
                />
                <Button type="button" variant="outline" onClick={addStatusCode}>
                  Add
                </Button>
              </div>
              <FormDescription className="text-xs">
                HTTP status codes that indicate success (default: 200)
              </FormDescription>
            </div>

            {/* Timing Configuration */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="interval"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check Interval</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          min="1"
                          max="60"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                        <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">
                          min
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeout"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timeout</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          min="5"
                          max="60"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                        <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">
                          sec
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="retries"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Retries</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="5"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Custom Headers */}
            <div className="space-y-2">
              <FormLabel>Custom Headers</FormLabel>
              {Object.entries(customHeaders).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center gap-2 p-2 bg-muted rounded"
                >
                  <span className="font-mono text-sm">{key}:</span>
                  <span className="font-mono text-sm flex-1">{value}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeHeader(key)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Header name"
                  value={newHeaderKey}
                  onChange={(e) => setNewHeaderKey(e.target.value)}
                />
                <Input
                  placeholder="Header value"
                  value={newHeaderValue}
                  onChange={(e) => setNewHeaderValue(e.target.value)}
                />
              </div>
              <Button type="button" variant="outline" onClick={addHeader}>
                Add Header
              </Button>
            </div>

            {/* Request Body */}
            {showBodyField && (
              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Request Body</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='{"key": "value"}'
                        className="font-mono"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      JSON payload for {selectedMethod} requests
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Active Status */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Active</FormLabel>
                    <FormDescription>
                      Enable or disable monitoring for this endpoint
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Monitor"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
