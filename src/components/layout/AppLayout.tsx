import { ReactNode } from "react";
import { AppHeader } from "./AppHeader";
import { ProgressIndicator } from "./ProgressIndicator";

interface AppLayoutProps {
  children: ReactNode;
  showProgress?: boolean;
}

export function AppLayout({ children, showProgress = true }: AppLayoutProps) {
  return (
    <div className="page-flow">
      <AppHeader />
      <main className="content-container">
        {showProgress && <ProgressIndicator />}
        <div className="animate-in fade-in duration-300">
          {children}
        </div>
      </main>
    </div>
  );
}