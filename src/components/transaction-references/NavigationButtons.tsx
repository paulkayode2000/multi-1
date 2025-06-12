import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { TransactionId } from "@/types/transaction";

interface NavigationButtonsProps {
  validTransactionIds: TransactionId[];
  selectedServiceId: string;
}

const NavigationButtons = ({ validTransactionIds, selectedServiceId }: NavigationButtonsProps) => {
  const navigate = useNavigate();

  const handleSaveAndContinue = () => {
    // Store valid transaction IDs in localStorage for the next page
    const validIds = validTransactionIds.map(tid => tid.value);
    localStorage.setItem('validTransactionIds', JSON.stringify(validIds));
    
    // Navigate to payment batch review page
    navigate('/payment-batch-review', { 
      state: { selectedService: selectedServiceId } 
    });
  };

  return (
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
  );
};

export default NavigationButtons;