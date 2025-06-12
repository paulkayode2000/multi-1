import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { BatchTransaction } from "@/types/batch";

interface NavigationButtonsProps {
  selectedServiceId: string;
  batchData: BatchTransaction[];
  totalSum: number;
}

const NavigationButtons = ({ selectedServiceId, batchData, totalSum }: NavigationButtonsProps) => {
  const navigate = useNavigate();

  const handleProceedToPayment = () => {
    // Store selected service ID in localStorage for the payment page
    localStorage.setItem('selectedServiceId', selectedServiceId);
    navigate('/make-payment', { state: { totalAmount: totalSum } });
  };

  return (
    <div className="flex justify-between">
      <Button variant="outline" className="flex items-center space-x-2" asChild>
        <Link to="/transaction-references" state={{ 
          selectedService: selectedServiceId,
          transactionIds: batchData.map(t => t.referenceId)
        }}>
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Link>
      </Button>
      <Button 
        className="flex items-center space-x-2" 
        disabled={batchData.length === 0}
        onClick={handleProceedToPayment}
      >
        <span>Proceed to Payment</span>
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default NavigationButtons;