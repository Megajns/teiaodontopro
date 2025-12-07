import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { LucideIcon } from "lucide-react";

// Fixed mobile table component with proper imports
// Force refresh to clear import cache

interface Column<T> {
  key: keyof T;
  header: string;
  className?: string;
  render?: (value: any, item: T) => React.ReactNode;
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  // Legacy support
  action?: { label: string; onClick: () => void };
}

// Support both render function and array-based action descriptors
type ActionDescriptor<T> = {
  label: string;
  icon?: LucideIcon;
  onClick: (item: T) => void;
  variant?: "default" | "secondary" | "destructive";
};

interface MobileTableProps<T> {
  data: T[];
  columns: Column<T>[];
  mobileCardRender?: (item: T) => React.ReactNode;
  actions?: ((item: T) => React.ReactNode | ActionDescriptor<T>[]) | ActionDescriptor<T>[];
  className?: string;
  emptyState?: EmptyStateProps;
  loading?: boolean;
}

export function MobileTable<T extends { id: number | string }>({
  data,
  columns,
  mobileCardRender,
  actions,
  className = "",
  emptyState,
  loading = false
}: MobileTableProps<T>) {
  const isMobile = useIsMobile();

  // Loading state
  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Carregando...</span>
        </div>
      </div>
    );
  }

  // Empty state
  if (data.length === 0 && emptyState) {
    const IconComponent = emptyState.icon;
    const actionLabel = emptyState.actionLabel ?? emptyState.action?.label;
    const onAction = emptyState.onAction ?? emptyState.action?.onClick;
    return (
      <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <IconComponent className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">{emptyState.title}</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">{emptyState.description}</p>
        {actionLabel && onAction && (
          <Button onClick={onAction} className="gap-2">
            <IconComponent className="w-4 h-4" />
            {actionLabel}
          </Button>
        )}
      </div>
    );
  }

  if (isMobile && mobileCardRender) {
    return (
      <div className={`space-y-4 ${className}`}>
        {data.map((item) => (
          <Card key={item.id} className="w-full">
            <CardContent className="p-4">
              {mobileCardRender(item)}
              {actions && (
                <div className="flex justify-end mt-3 pt-3 border-t border-border">
                  {(() => {
                    if (typeof actions === "function") {
                      const result = (actions as (i: T) => React.ReactNode | ActionDescriptor<T>[])(item);
                      if (Array.isArray(result)) {
                        return (
                          <div className="flex items-center gap-2">
                            {result.map((action, idx) => {
                              const isDanger = action.variant === "destructive";
                              return (
                                <Button
                                  key={idx}
                                  variant={isDanger ? "ghost" : (action.variant ?? "ghost")}
                                  size="sm"
                                  className={`${isDanger ? "text-destructive " : ""}h-8 px-2`}
                                  onClick={() => action.onClick(item)}
                                >
                                  {action.icon && <action.icon className="w-4 h-4" />}
                                  <span className="sr-only sm:not-sr-only sm:ml-1">{action.label}</span>
                                </Button>
                              );
                            })}
                          </div>
                        );
                      }
                      return result as React.ReactNode;
                    }
                    // actions is an array of descriptors
                    return (
                      <div className="flex items-center gap-2">
                        {(actions as ActionDescriptor<T>[]).map((action, idx) => {
                          const isDanger = action.variant === "destructive";
                          return (
                            <Button
                              key={idx}
                              variant={isDanger ? "ghost" : (action.variant ?? "ghost")}
                              size="sm"
                              className={`${isDanger ? "text-destructive " : ""}h-8 px-2`}
                              onClick={() => action.onClick(item)}
                            >
                              {action.icon && <action.icon className="w-4 h-4" />}
                              <span className="sr-only sm:not-sr-only sm:ml-1">{action.label}</span>
                            </Button>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <ScrollArea className="w-full">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b">
                {columns.map((column) => (
                  <th 
                    key={String(column.key)} 
                    className={`text-left p-4 font-medium whitespace-nowrap ${column.className || ''}`}
                  >
                    {('header' in column && (column as any).header) || ('label' in column && (column as any).label) || ''}
                  </th>
                ))}
                {actions && (
                  <th className="text-left p-4 font-medium whitespace-nowrap">
                    Ações
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {data.length === 0 && emptyState ? (
                <tr>
                  <td colSpan={columns.length + (actions ? 1 : 0)} className="p-12">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                        {(() => { const IconComponent = emptyState.icon; return <IconComponent className="w-6 h-6 text-muted-foreground" />; })()}
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2">{emptyState.title}</h3>
                      <p className="text-muted-foreground mb-6 max-w-sm">{emptyState.description}</p>
                      {(() => {
                        const actionLabel = emptyState.actionLabel ?? emptyState.action?.label;
                        const onAction = emptyState.onAction ?? emptyState.action?.onClick;
                        if (actionLabel && onAction) {
                          const IconComponent = emptyState.icon;
                          return (
                            <Button onClick={onAction} className="gap-2">
                              <IconComponent className="w-4 h-4" />
                              {actionLabel}
                            </Button>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-muted/50 transition-colors">
                    {columns.map((column) => (
                      <td key={String(column.key)} className={`p-4 ${column.className || ''}`}>
                        {column.render 
                          ? column.render(item[column.key], item)
                          : String(item[column.key] || '')}
                      </td>
                    ))}
                    {actions && (
                      <td className="p-4">
                        {(() => {
                          if (typeof actions === "function") {
                            const result = (actions as (i: T) => React.ReactNode | ActionDescriptor<T>[])(item);
                            if (Array.isArray(result)) {
                              return (
                                <div className="flex items-center gap-2">
                                  {result.map((action, idx) => {
                                    const isDanger = action.variant === "destructive";
                                    return (
                                      <Button
                                        key={idx}
                                        variant={isDanger ? "ghost" : (action.variant ?? "ghost")}
                                        size="sm"
                                        className={`${isDanger ? "text-destructive " : ""}h-8 px-2`}
                                        onClick={() => action.onClick(item)}
                                      >
                                        {action.icon && <action.icon className="w-4 h-4" />}
                                        <span className="sr-only sm:not-sr-only sm:ml-1">{action.label}</span>
                                      </Button>
                                    );
                                  })}
                                </div>
                              );
                            }
                            return result as React.ReactNode;
                          }
                          // actions is an array of descriptors
                          return (
                            <div className="flex items-center gap-2">
                              {(actions as ActionDescriptor<T>[]).map((action, idx) => {
                                const isDanger = action.variant === "destructive";
                                return (
                                  <Button
                                    key={idx}
                                    variant={isDanger ? "ghost" : (action.variant ?? "ghost")}
                                    size="sm"
                                    className={`${isDanger ? "text-destructive " : ""}h-8 px-2`}
                                    onClick={() => action.onClick(item)}
                                  >
                                    {action.icon && <action.icon className="w-4 h-4" />}
                                    <span className="sr-only sm:not-sr-only sm:ml-1">{action.label}</span>
                                  </Button>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </ScrollArea>
    </div>
  );
}