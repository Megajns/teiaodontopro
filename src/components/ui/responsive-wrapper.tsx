import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ResponsiveWrapperProps {
  children: React.ReactNode;
  mobileComponent?: React.ReactNode;
  className?: string;
}

export function ResponsiveWrapper({ 
  children, 
  mobileComponent, 
  className = "" 
}: ResponsiveWrapperProps) {
  const isMobile = useIsMobile();

  if (isMobile && mobileComponent) {
    return <div className={className}>{mobileComponent}</div>;
  }

  return <div className={className}>{children}</div>;
}