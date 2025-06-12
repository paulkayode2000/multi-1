import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { TransactionId } from "@/types/transaction";
import { useToast } from "@/hooks/use-toast";
import { validateTransactionId } from "@/utils/transactionValidation";

interface TransactionIdInputProps {
  transactionIds: TransactionId[];
  onAddTransactionId: (newId: TransactionId) => void;
  onUpdateTransactionId: (id: string, updates: Partial<TransactionId>) => void;
  isValidating: boolean;
  onValidatingChange: (validating: boolean) => void;
}

const TransactionIdInput = ({ 
  transactionIds, 
  onAddTransactionId, 
  onUpdateTransactionId,
  isValidating,
  onValidatingChange
}: TransactionIdInputProps) => {
  const [currentInput, setCurrentInput] = useState("");
  const { toast } = useToast();

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

    onAddTransactionId(newId);
    setCurrentInput("");
    onValidatingChange(true);

    try {
      const isValid = await validateTransactionId(newId.value);
      onUpdateTransactionId(newId.id, { isValid, isValidating: false });

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
      onUpdateTransactionId(newId.id, { isValid: false, isValidating: false });
      toast({
        title: "Error",
        description: "Failed to validate Transaction ID",
        variant: "destructive",
      });
    } finally {
      onValidatingChange(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddTransactionId();
    }
  };

  return (
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
  );
};

export default TransactionIdInput;