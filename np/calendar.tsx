import { generateEntityHooks } from "./hooks/generateEntityHooks";
import { CalenderEvent } from "./types";

export const {
  useAddCalendarEvent,
  useUpdateCalendarEvent,
  useDeleteCalendarEvent,
  useCalendarEvents,
} = generateEntityHooks<"calendarEvent", CalenderEvent>({
  entityName: "calendarEvent",
  path: "calendar/events",
});

export const {
  useAddPersonalCalendarEvent,
  useUpdatePersonalCalendarEvent,
  useDeletePersonalCalendarEvent,
  usePersonalCalendarEvents,
} = generateEntityHooks<"personalCalendarEvent", CalenderEvent>({
  entityName: "personalCalendarEvent",
  path: "calendar/events/personal_space",
});
