import { Creator } from "../types";

export enum CustomerTypeFilterEnum {
    "Prospect" = "Prospect",
    "Lead" = "Lead",
    "Full" = "Full",
    "All" = "All",
}

export type CustomerType = "Prospect" | "Lead" | "Full";

export enum CustomerSaleType {
    Recurring = "Recurring",
    OnceOff = "Once Off",
}

export type Contact = {
    id: string;                    // Contact ID
    customerId: string;            // Associated customer ID
    firstname: string;             // First name (required)
    lastname: string;              // Last name (required)
    email: string;                 // Email address (required)
    phoneNumber?: string;          // Phone number (optional)
    jobtitle?: string;             // Job title (optional)
    department?: string;           // Department (optional)
    isPrimary: boolean;            // Whether this is the primary contact
    created: number;               // Creation timestamp
    updated: number;               // Last update timestamp
    creator: {                     // Creator information
        projectUid: string;          // Project user ID
        sessionUid: string;          // Session user ID
        name?: string;               // Creator name (optional)
        created?: number;            // Creator creation timestamp (optional)
        avatar?: {                   // Creator avatar (optional)
            original?: string;
        };
    };
};

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
    saleType: CustomerSaleType.Recurring | CustomerSaleType.OnceOff;
    address?: any;
    province: string;
};