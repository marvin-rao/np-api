import { useGet } from "../../helper/ApiRequestsBase";
import { Contact, Customer, CustomerTypeFilterEnum } from "./types";
import { generateEntityHooks } from "../hooks/generateEntityHooks";
import { useProjectId } from "../projects";

export const { useAddCustomer, useUpdateCustomer, useDeleteCustomer } =
  generateEntityHooks<"customer", Customer>({
    entityName: "customer",
    path: "customers",
  });

export const {
  useAddContact,
  useUpdateContact,
  useDeleteContact,
  useContacts,
} = generateEntityHooks<"contact", Contact>({
  entityName: "contact",
  path: "contacts",
});

export const useCustomers = (type?: CustomerTypeFilterEnum) => {
  const { projectId } = useProjectId();

  // Build query string with projectId and optional type
  let queryString = `?projectId=${projectId}`;
  if (type) {
    queryString += `&type=${type}`;
  }

  return useGet<Customer[]>({
    path: "customers",
    options: { queryString },
    deps: [projectId, type],
  });
};
