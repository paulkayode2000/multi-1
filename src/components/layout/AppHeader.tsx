import { ThemeToggle } from "./ThemeToggle";

export function AppHeader() {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payment System</h1>
          <p className="text-sm text-muted-foreground">Secure transaction processing</p>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}