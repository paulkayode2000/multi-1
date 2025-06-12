import { Database, Shield, Globe } from "lucide-react";
import { Service } from "@/types/transaction";
import NISLogo from "@/components/icons/NISLogo";

export const services: Service[] = [
  { id: "service1", name: "Nigeria Immigration Service (NIS)", icon: NISLogo },
  { id: "service2", name: "Service2", icon: Database },
  { id: "service3", name: "Service3", icon: Shield },
  { id: "service4", name: "Service4", icon: Globe },
];