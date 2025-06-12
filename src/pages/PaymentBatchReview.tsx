import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, ArrowRight, Eye, Trash2, Search, Settings, Database, Shield, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const services = [
  { id: "service1", name: "Service1", icon: Settings },
  { id: "service2", name: "Service2", icon: Database },
  { id: "service3", name: "Service3", icon: Shield },
  { id: "service4", name: "Service4", icon: Globe },
];

interface BatchTransaction {
  id: string;
  referenceId: string;
  customerName: string;
  applicationFee: number;
  charges: number;
  subTotal: number;
}

// Mock customer names for generation
const mockCustomerNames = [
  "Adebayo Johnson", "Fatima Mohammed", "Chinedu Okafor", "Aisha Bello",
  "Emeka Nwosu", "Kemi Adeleke", "Ibrahim Yakubu", "Ngozi Okoro",
  "Musa Abdullahi", "Folake Adeyemi", "Usman Garba", "Chioma Eze",
  "Ahmed Hassan", "Funmi Oladele", "Sani Musa", "Blessing Udo"
];

// Generate random amount between min and max
const generateAmount = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Generate mock batch data based on transaction IDs
const generateBatchData = (transactionIds: string[]): BatchTransaction[] => {
  return transactionIds.map((refId, index) => {
    const applicationFee = generateAmount(500, 2000);
    const charges = generateAmount(100, 800);
    
    return {
      id: `batch_${index}_${refId}`,
      referenceId: refId,
      customerName: mockCustomerNames[Math.floor(Math.random() * mockCustomerNames.length)],
      applicationFee,
      charges,
      subTotal: applicationFee + charges,
    };
  });
};

// Format currency with Naira symbol
const formatCurrency = (amount: number): string => {
  return `₦${amount.toLocaleString()}`;
};

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

  const IconComponent = selectedService.icon;
  const isAllSelected = filteredData.length > 0 && selectedRows.size === filteredData.length;
  const isSomeSelected = selectedRows.size > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Review Payment Batch</h1>
          
          {/* Selected Service Display */}
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <IconComponent className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-medium text-foreground">{selectedService.name}</span>
          </div>
          
          <p className="text-muted-foreground">
            Review all transactions for this batch ({batchData.length} transactions)
          </p>
        </div>

        {/* Search and Actions */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              {isSomeSelected && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="flex items-center space-x-2">
                      <Trash2 className="h-4 w-4" />
                      <span>Delete Selected ({selectedRows.size})</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Selected Transactions</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {selectedRows.size} selected transaction(s)? 
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteSelected}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Batch Data Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Transaction Details</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredData.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {searchTerm ? "No transactions match your search." : "No transactions found."}
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={isAllSelected}
                          onCheckedChange={handleSelectAll}
                          aria-label="Select all"
                        />
                      </TableHead>
                      <TableHead>Reference ID</TableHead>
                      <TableHead>Customer Name</TableHead>
                      <TableHead className="text-right">Application Fee</TableHead>
                      <TableHead className="text-right">Charges</TableHead>
                      <TableHead className="text-right">Sub Total</TableHead>
                      <TableHead className="w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((transaction, index) => (
                      <TableRow 
                        key={transaction.id}
                        className={index % 2 === 0 ? "bg-background" : "bg-muted/50"}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedRows.has(transaction.id)}
                            onCheckedChange={(checked) => handleRowSelect(transaction.id, checked as boolean)}
                            aria-label={`Select transaction ${transaction.referenceId}`}
                          />
                        </TableCell>
                        <TableCell className="font-mono text-sm">{transaction.referenceId}</TableCell>
                        <TableCell className="font-medium">{transaction.customerName}</TableCell>
                        <TableCell className="text-right">{formatCurrency(transaction.applicationFee)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(transaction.charges)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(transaction.subTotal)}</TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Transaction Details</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Reference ID</label>
                                  <p className="font-mono text-sm">{transaction.referenceId}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Customer Name</label>
                                  <p className="font-medium">{transaction.customerName}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Application Fee</label>
                                    <p>{formatCurrency(transaction.applicationFee)}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Charges</label>
                                    <p>{formatCurrency(transaction.charges)}</p>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Sub Total</label>
                                  <p className="text-lg font-bold">{formatCurrency(transaction.subTotal)}</p>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* Total Row */}
                    <TableRow className="border-t-2 bg-muted/30 font-medium">
                      <TableCell colSpan={5} className="text-right font-bold">
                        Total Payment:
                      </TableCell>
                      <TableCell className="text-right text-lg font-bold text-primary">
                        {formatCurrency(totalSum)}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
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
          >
            <span>Proceed to Payment</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentBatchReview;