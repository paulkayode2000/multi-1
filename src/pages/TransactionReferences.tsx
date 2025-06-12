import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { services } from "@/constants/services";
import { TransactionId } from "@/types/transaction";
import ServiceHeader from "@/components/transaction-references/ServiceHeader";
import TransactionIdInput from "@/components/transaction-references/TransactionIdInput";
import TransactionIdsList from "@/components/transaction-references/TransactionIdsList";
import NavigationButtons from "@/components/transaction-references/NavigationButtons";
import { AppLayout } from "@/components/layout/AppLayout";

const TransactionReferences = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [transactionIds, setTransactionIds] = useState<TransactionId[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  // Get selected service from navigation state
  const selectedServiceId = location.state?.selectedService;
  const selectedService = services.find(s => s.id === selectedServiceId);
  const incomingTransactionIds = location.state?.transactionIds || [];

  // Redirect to home if no service selected and load incoming transaction IDs
  useEffect(() => {
    if (!selectedService) {
      navigate("/");
    } else if (incomingTransactionIds.length > 0) {
      // Recreate transaction objects from incoming IDs
      const recreatedTransactions = incomingTransactionIds.map((refId, index) => ({
        id: `restored_${index}_${refId}`,
        value: refId,
        isValid: true,
        isValidating: false,
      }));
      setTransactionIds(recreatedTransactions);
    }
  }, [selectedService, navigate, incomingTransactionIds]);

  const handleAddTransactionId = (newId: TransactionId) => {
    setTransactionIds(prev => [...prev, newId]);
  };

  const handleUpdateTransactionId = (id: string, updates: Partial<TransactionId>) => {
    setTransactionIds(prev => 
      prev.map(tid => 
        tid.id === id ? { ...tid, ...updates } : tid
      )
    );
  };

  const handleRemoveTransactionId = (idToRemove: string) => {
    setTransactionIds(prev => prev.filter(tid => tid.id !== idToRemove));
  };

  const validTransactionIds = transactionIds.filter(tid => tid.isValid);

  if (!selectedService) {
    return null;
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <ServiceHeader 
          selectedService={selectedService} 
          transactionCount={transactionIds.length}
        />

        <TransactionIdInput
          transactionIds={transactionIds}
          onAddTransactionId={handleAddTransactionId}
          onUpdateTransactionId={handleUpdateTransactionId}
          isValidating={isValidating}
          onValidatingChange={setIsValidating}
        />

        <TransactionIdsList
          transactionIds={transactionIds}
          onRemoveTransactionId={handleRemoveTransactionId}
        />

        <NavigationButtons
          validTransactionIds={validTransactionIds}
          selectedServiceId={selectedServiceId}
        />
      </div>
    </AppLayout>
  );
};

export default TransactionReferences;