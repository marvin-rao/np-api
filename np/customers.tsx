import { generateEntityHooks } from "./hooks/generateEntityHooks";
import { Creator } from "./types";

export enum CustomerTypeFilterEnum {
  "Prospect" = "Prospect",
  "Lead" = "Lead",
  "Full" = "Full",
  "All" = "All",
}

export type CustomerType = "Prospect" | "Lead" | "Full";

export type Customer = {
  businessName: string;
  firstname: string;
  lastname: string;
  id: string;
  type: CustomerType;
  created: number;
  updated: number;
  creator: Creator;
  orderValue?: number;
  mrr?: number;
  myy?: number;
  // Contact;
  contactEmail: string;
  contactPhoneNumber: string;
  contactFirstName: string;
  contactLastName: string;
  entityType: "Individual" | "Business";
  saleType: any;
  address?: any;
  province: string;
};

export const {
  useCustomers,
  useAddCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
} = generateEntityHooks<"customer", Customer>({
  entityName: "customer",
  path: "customers",
});
