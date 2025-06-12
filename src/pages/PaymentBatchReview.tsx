import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { BatchTransaction, Service } from "@/types/batch";
import { generateBatchData } from "@/utils/batchUtils";
import { services } from "@/constants/services";
import BatchHeader from "@/components/batch/BatchHeader";
import SearchAndActions from "@/components/batch/SearchAndActions";
import TransactionTable from "@/components/batch/TransactionTable";
import NavigationButtons from "@/components/batch/NavigationButtons";

const PaymentBatchReview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [batchData, setBatchData] = useState<BatchTransaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Get selected service from navigation state
  const selectedServiceId = location.state?.selectedService;
  const selectedService = services.find(s => s.id === selectedServiceId);

  // Load and generate batch data
  useEffect(() => {
    const loadBatchData = () => {
      try {
        // Get transaction IDs from localStorage
        const storedTransactionIds = localStorage.getItem('validTransactionIds');
        if (!storedTransactionIds) {
          navigate('/transaction-references');
          return;
        }

        const transactionIds = JSON.parse(storedTransactionIds);
        if (transactionIds.length === 0) {
          navigate('/transaction-references');
          return;
        }

        // Check if we already have batch data for these IDs
        const storedBatchData = localStorage.getItem('batchData');
        if (storedBatchData) {
          const parsedData = JSON.parse(storedBatchData);
          // Verify the data matches current transaction IDs
          if (parsedData.length === transactionIds.length) {
            setBatchData(parsedData);
            setIsLoading(false);
            return;
          }
        }

        // Generate new batch data
        const newBatchData = generateBatchData(transactionIds);
        setBatchData(newBatchData);
        localStorage.setItem('batchData', JSON.stringify(newBatchData));
        setIsLoading(false);

      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load batch data",
          variant: "destructive",
        });
        navigate('/transaction-references');
      }
    };

    loadBatchData();
  }, [navigate, toast]);

  // Redirect if no service selected
  useEffect(() => {
    if (!selectedService) {
      navigate("/");
    }
  }, [selectedService, navigate]);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return batchData;
    
    return batchData.filter(transaction =>
      transaction.referenceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.applicationFee.toString().includes(searchTerm) ||
      transaction.charges.toString().includes(searchTerm) ||
      transaction.subTotal.toString().includes(searchTerm)
    );
  }, [batchData, searchTerm]);

  // Calculate total sum
  const totalSum = useMemo(() => {
    return filteredData.reduce((sum, transaction) => sum + transaction.subTotal, 0);
  }, [filteredData]);

  // Handle row selection
  const handleRowSelect = (transactionId: string, checked: boolean) => {
    const newSelection = new Set(selectedRows);
    if (checked) {
      newSelection.add(transactionId);
    } else {
      newSelection.delete(transactionId);
    }
    setSelectedRows(newSelection);
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(filteredData.map(t => t.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  // Handle delete selected rows
  const handleDeleteSelected = () => {
    const remainingData = batchData.filter(transaction => !selectedRows.has(transaction.id));
    setBatchData(remainingData);
    localStorage.setItem('batchData', JSON.stringify(remainingData));
    setSelectedRows(new Set());
    
    toast({
      title: "Success",
      description: `Deleted ${selectedRows.size} transaction(s)`,
    });
  };

  if (!selectedService) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading batch data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <BatchHeader selectedService={selectedService} transactionCount={batchData.length} />
        
        <SearchAndActions 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedRowsCount={selectedRows.size}
          onDeleteSelected={handleDeleteSelected}
        />

        <TransactionTable 
          filteredData={filteredData}
          searchTerm={searchTerm}
          selectedRows={selectedRows}
          onRowSelect={handleRowSelect}
          onSelectAll={handleSelectAll}
          totalSum={totalSum}
        />

        <NavigationButtons 
          selectedServiceId={selectedServiceId}
          batchData={batchData}
          totalSum={totalSum}
        />
      </div>
    </div>
  );
};

export default PaymentBatchReview;