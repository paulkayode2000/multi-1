import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Database, Shield, Globe } from "lucide-react";

import NISLogo from "@/components/icons/NISLogo";

const services = [
  { id: "service1", name: "Nigeria Immigration Service (NIS)", icon: NISLogo },
  { id: "service2", name: "Service2", icon: Database },
  { id: "service3", name: "Service3", icon: Shield },
  { id: "service4", name: "Service4", icon: Globe },
];

const Index = () => {
  const [selectedService, setSelectedService] = useState("");
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (selectedService) {
      navigate("/transaction-references", { 
        state: { selectedService } 
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Service portal</h1>
          <p className="text-muted-foreground">Select the service you want to make payment for</p>
        </div>

        {/* Service Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Choose a service</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedService} onValueChange={setSelectedService}>
              <div className="space-y-4">
                {services.map((service) => {
                  const IconComponent = service.icon;
                  return (
                    <div key={service.id} className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent transition-colors">
                      <RadioGroupItem value={service.id} id={service.id} />
                      <Label htmlFor={service.id} className="flex items-center space-x-3 cursor-pointer flex-1">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <IconComponent className="h-6 w-6 text-primary" />
                        </div>
                        <span className="text-lg font-medium">{service.name}</span>
                      </Label>
                    </div>
                  );
                })}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button variant="outline" className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <Button 
            className="flex items-center space-x-2" 
            disabled={!selectedService}
            onClick={handleGetStarted}
          >
            <span>Get started</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
