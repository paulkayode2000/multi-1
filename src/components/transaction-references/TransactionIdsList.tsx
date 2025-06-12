import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";
import { TransactionId } from "@/types/transaction";

interface TransactionIdsListProps {
  transactionIds: TransactionId[];
  onRemoveTransactionId: (id: string) => void;
}

const TransactionIdsList = ({ transactionIds, onRemoveTransactionId }: TransactionIdsListProps) => {
  if (transactionIds.length === 0) {
    return null;
  }

  return (
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
                onClick={() => onRemoveTransactionId(tid.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionIdsList;