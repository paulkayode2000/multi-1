import { Globe } from "lucide-react";
import { Service } from "@/types/transaction";
import NISLogo from "@/components/icons/NISLogo";
import FRSCLogo from "@/components/icons/FRSCLogo";
import CRFFNLogo from "@/components/icons/CRFFNLogo";

export const services: Service[] = [
  { id: "service1", name: "Nigeria Immigration Service (NIS)", icon: NISLogo },
  { id: "service2", name: "Federal Road Safety Commission (FRSC)", icon: FRSCLogo },
  { id: "service3", name: "Council for the Regulation of Freight Forwarding in Nigeria (CRFFN)", icon: CRFFNLogo },
  { id: "service4", name: "Service4", icon: Globe },
];