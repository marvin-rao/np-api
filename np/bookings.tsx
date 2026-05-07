import { generateEntityHooks } from "./hooks/generateEntityHooks";
import {
    Booking,
    BookingResource,
    BookingResourceGroup,
} from "./types";

export type {
    Booking,
    BookingStatus,
    BookingResource,
    BookingResourceGroup,
} from "./types";

export const {
    useBookings,
    useAddBooking,
    useUpdateBooking,
    useDeleteBooking,
} = generateEntityHooks<"booking", Booking>({
    entityName: "booking",
    path: "bookings",
});

export const {
    useBookingResources,
    useAddBookingResource,
    useUpdateBookingResource,
    useDeleteBookingResource,
} = generateEntityHooks<"bookingResource", BookingResource>({
    entityName: "bookingResource",
    path: "bookings/resources",
});

export const {
    useBookingResourceGroups,
    useAddBookingResourceGroup,
    useUpdateBookingResourceGroup,
    useDeleteBookingResourceGroup,
} = generateEntityHooks<"bookingResourceGroup", BookingResourceGroup>({
    entityName: "bookingResourceGroup",
    path: "bookings/resource_groups",
});
