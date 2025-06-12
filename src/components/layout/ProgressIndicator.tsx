import { useLocation } from "react-router-dom";

const steps = [
  { path: "/", label: "Service Selection", step: 1 },
  { path: "/transaction-references", label: "Transaction IDs", step: 2 },
  { path: "/payment-batch-review", label: "Review", step: 3 },
  { path: "/make-payment", label: "Payment", step: 4 },
];

export function ProgressIndicator() {
  const location = useLocation();
  
  const currentStep = steps.find(step => step.path === location.pathname)?.step || 1;

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.path} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  step.step <= currentStep
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step.step}
              </div>
              <span className="text-xs mt-2 text-center max-w-20 text-muted-foreground">
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-4 transition-all ${
                  step.step < currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}