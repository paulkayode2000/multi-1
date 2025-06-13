import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CreditCard, Building2, Smartphone, University } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { secureStorage } from "@/lib/secureStorage";
import { validateAndSanitizeJsonData, validateAmount } from "@/lib/dataValidation";

const paymentMethods = [
  { id: "card", name: "Card", icon: CreditCard },
  { id: "direct-debit", name: "Direct Debit", icon: University },
  { id: "bank", name: "Bank Transfer", icon: Building2 },
  { id: "ussd", name: "USSD", icon: Smartphone },
];

// Format currency with Naira symbol
const formatCurrency = (amount: number): string => {
  return `₦${amount.toLocaleString()}`;
};

const MakePayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");

  // Load total amount and service info from secure storage or navigation state
  useEffect(() => {
    const loadPaymentData = async () => {
      try {
        // Try to get amount from navigation state first
        const navigationAmount = location.state?.totalAmount;
        
        // Get selected service ID from secure storage (stored by NavigationButtons in review page)
        const storedSelectedService = await secureStorage.getItem('selectedServiceId');
        if (storedSelectedService) {
          setSelectedServiceId(storedSelectedService);
        }

        if (navigationAmount && validateAmount(navigationAmount)) {
          setTotalAmount(navigationAmount);
          setIsLoading(false);
          return;
        }

        // Fallback to calculating from batch data
        const storedBatchData = await secureStorage.getItem('batchData');
        if (!storedBatchData) {
          navigate('/transaction-references');
          return;
        }

        const batchData = JSON.parse(storedBatchData);
        const sanitizedData = validateAndSanitizeJsonData(batchData);
        const total = sanitizedData.reduce((sum: number, transaction: any) => sum + transaction.subTotal, 0);
        
        if (total === 0) {
          navigate('/payment-batch-review');
          return;
        }

        setTotalAmount(total);
        setIsLoading(false);

      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load payment data",
          variant: "destructive",
        });
        navigate('/payment-batch-review');
      }
    };

    loadPaymentData();
  }, [location.state, navigate, toast]);

  const handlePayment = () => {
    if (!selectedPaymentMethod) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method to continue",
        variant: "destructive",
      });
      return;
    }

    // Here you would integrate with actual payment processing
    toast({
      title: "Payment Initiated",
      description: `Processing payment of ${formatCurrency(totalAmount)} via ${paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}`,
    });
  };

  if (isLoading) {
    return (
      <AppLayout showProgress={false}>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading payment details...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-6">Make Payment</h1>
          
          {/* Total Amount Display */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-8">
            <p className="text-sm text-muted-foreground mb-2">Total Payment Amount</p>
            <p className="text-4xl font-bold text-primary">{formatCurrency(totalAmount)}</p>
          </div>
        </div>

        {/* Payment Methods */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-center">Choose Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
              <div className="grid grid-cols-2 gap-4">
                {paymentMethods.map((method) => {
                  const IconComponent = method.icon;
                  const isSelected = selectedPaymentMethod === method.id;
                  
                  return (
                    <div key={method.id}>
                      <Label
                        htmlFor={method.id}
                        className={`cursor-pointer block border-2 rounded-lg p-6 text-center transition-all hover:border-primary/50 ${
                          isSelected 
                            ? "border-primary bg-primary/5" 
                            : "border-border bg-background"
                        }`}
                      >
                        <RadioGroupItem
                          value={method.id}
                          id={method.id}
                          className="sr-only"
                        />
                        <div className="flex flex-col items-center space-y-3">
                          <div className={`p-3 rounded-full ${
                            isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          }`}>
                            <IconComponent className="h-6 w-6" />
                          </div>
                          <span className={`font-medium ${
                            isSelected ? "text-primary" : "text-foreground"
                          }`}>
                            {method.name}
                          </span>
                        </div>
                      </Label>
                    </div>
                  );
                })}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Pay Button */}
        <div className="mb-8">
          <Button
            onClick={handlePayment}
            disabled={!selectedPaymentMethod}
            className="w-full h-14 text-lg font-semibold"
            size="lg"
          >
            Pay {formatCurrency(totalAmount)}
          </Button>
        </div>

        {/* Back Button */}
        <div className="flex justify-center">
          <Button variant="outline" className="flex items-center space-x-2" asChild>
            <Link 
              to="/payment-batch-review" 
              state={{ selectedService: selectedServiceId }}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Review</span>
            </Link>
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default MakePayment;