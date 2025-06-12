import { Settings, Database, Shield, Globe } from "lucide-react";
import { Service } from "@/types/transaction";

export const services: Service[] = [
  { id: "service1", name: "Service1", icon: Settings },
  { id: "service2", name: "Service2", icon: Database },
  { id: "service3", name: "Service3", icon: Shield },
  { id: "service4", name: "Service4", icon: Globe },
];