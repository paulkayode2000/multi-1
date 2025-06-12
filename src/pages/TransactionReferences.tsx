import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Check, X, Loader2, Settings, Database, Shield, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const services = [
  { id: "service1", name: "Service1", icon: Settings },
  { id: "service2", name: "Service2", icon: Database },
  { id: "service3", name: "Service3", icon: Shield },
  { id: "service4", name: "Service4", icon: Globe },
];

interface TransactionId {
  id: string;
  value: string;
  isValid: boolean;
  isValidating: boolean;
}

// Mock API call to validate transaction ID
const validateTransactionId = async (transactionId: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate API response - returns true for IDs longer than 3 characters
      resolve(transactionId.length > 3);
    }, 1000);
  });
};

const TransactionReferences = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentInput, setCurrentInput] = useState("");
  const [transactionIds, setTransactionIds] = useState<TransactionId[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  // Get selected service from navigation state
  const selectedServiceId = location.state?.selectedService;
  const selectedService = services.find(s => s.id === selectedServiceId);

  // Redirect to home if no service selected
  useEffect(() => {
    if (!selectedService) {
      navigate("/");
    }
  }, [selectedService, navigate]);

  const handleAddTransactionId = async () => {
    if (!currentInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter a Transaction ID",
        variant: "destructive",
      });
      return;
    }

    if (transactionIds.length >= 20) {
      toast({
        title: "Limit Reached",
        description: "You can add up to 20 Transaction IDs only",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicates
    if (transactionIds.some(tid => tid.value === currentInput.trim())) {
      toast({
        title: "Duplicate ID",
        description: "This Transaction ID has already been added",
        variant: "destructive",
      });
      return;
    }

    const newId: TransactionId = {
      id: Math.random().toString(36).substr(2, 9),
      value: currentInput.trim(),
      isValid: false,
      isValidating: true,
    };

    setTransactionIds(prev => [...prev, newId]);
    setCurrentInput("");
    setIsValidating(true);

    try {
      const isValid = await validateTransactionId(newId.value);
      setTransactionIds(prev => 
        prev.map(tid => 
          tid.id === newId.id 
            ? { ...tid, isValid, isValidating: false }
            : tid
        )
      );

      if (isValid) {
        toast({
          title: "Success",
          description: "Transaction ID validated successfully",
        });
      } else {
        toast({
          title: "Validation Failed",
          description: "Transaction ID could not be validated",
          variant: "destructive",
        });
      }
    } catch (error) {
      setTransactionIds(prev => 
        prev.map(tid => 
          tid.id === newId.id 
            ? { ...tid, isValid: false, isValidating: false }
            : tid
        )
      );
      toast({
        title: "Error",
        description: "Failed to validate Transaction ID",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveTransactionId = (idToRemove: string) => {
    setTransactionIds(prev => prev.filter(tid => tid.id !== idToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddTransactionId();
    }
  };

  const validTransactionIds = transactionIds.filter(tid => tid.isValid);

  const handleSaveAndContinue = () => {
    // Store valid transaction IDs in localStorage for the next page
    const validIds = validTransactionIds.map(tid => tid.value);
    localStorage.setItem('validTransactionIds', JSON.stringify(validIds));
    
    // Navigate to payment batch review page
    navigate('/payment-batch-review', { 
      state: { selectedService: selectedServiceId } 
    });
  };

  if (!selectedService) {
    return null;
  }

  const IconComponent = selectedService.icon;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Transaction References</h1>
          
          {/* Selected Service Display */}
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <IconComponent className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-medium text-foreground">{selectedService.name}</span>
          </div>
          
          <p className="text-muted-foreground">
            Add Transaction IDs for validation ({transactionIds.length} of 20)
          </p>
        </div>

        {/* Transaction ID Input */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Add Transaction ID</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="transaction-id">Transaction ID</Label>
              <div className="flex space-x-2">
                <Input
                  id="transaction-id"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter Transaction ID"
                  disabled={isValidating || transactionIds.length >= 20}
                />
                <Button 
                  onClick={handleAddTransactionId}
                  disabled={!currentInput.trim() || isValidating || transactionIds.length >= 20}
                  className="px-6"
                >
                  {isValidating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Add"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction IDs List */}
        {transactionIds.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl">Added Transaction IDs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactionIds.map((tid) => (
                  <div key={tid.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-sm">{tid.value}</span>
                      {tid.isValidating ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : tid.isValid ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveTransactionId(tid.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button variant="outline" className="flex items-center space-x-2" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Link>
          </Button>
          <Button 
            className="flex items-center space-x-2" 
            disabled={validTransactionIds.length === 0}
            onClick={handleSaveAndContinue}
          >
            <span>Save & Continue</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TransactionReferences;