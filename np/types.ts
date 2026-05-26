import { z } from "zod";
import { ProjectUser } from "../api";
import { ProductSettings } from "./components/workspace/types";

// Zod Schemas
export const CreatorSchema = z.object({
    projectUid: z.string(),
    sessionUid: z.string(),
    name: z.string().optional(),
    created: z.number().optional(),
});

export const RecruitSkillSchema = z.object({
    id: z.string(),
    name: z.string(),
    created: z.number(),
    creator: CreatorSchema,
    updated: z.number().optional(),
    category: z.object({
        id: z.string(),
        name: z.string().optional(),
    }).optional(),
    type: z.enum(["skills", "openToWorkWithSkills"]),
    level: z.enum(["beginner", "intermediate", "advanced", "expert"]),
});


export type RecruitSkill = z.infer<typeof RecruitSkillSchema>;

export type ServerResult<T = unknown> = {
    message: string, data: T,
}

// Recruit
export type RecruitProfile = {
    id: string;
    email: string;
    isSessionUser: boolean;
    name: string;
    avatar?: {
        original: string;
    }
    skills: RecruitSkill[];
    openToWorkWithSkills: RecruitSkill[];
    jobtitle?: string,
    about?: string,
    availableHoursPerWeek?: number
    prefersToWorkWith?: string;
    contactPhoneNumber?: string;
}

export type Creator = {
    projectUid: string;
    sessionUid: string;
    name?: string | undefined;
    created?: number | undefined;
};


export type SkillCategory = {
    id: string;
    name: string;
    created: number;
    creator: Creator;
    updated?: number | undefined;
};

export type Note = {
    id: string;
    created: number;
    creator: Creator;
    folderId: string;
    originId: string;
    title: string;
    sharedWith: string[];
    mentions: string[];
    updated?: number | undefined;
    content?: string | undefined;
    fromServer?: boolean | undefined;
    /** Soft-delete flag. When true, the note is in the trash. */
    trashed?: boolean | undefined;
    /** Server timestamp the note was moved to trash. */
    trashedAt?: number | undefined;
    /** Folder the note will be restored to. */
    trashedFromFolderId?: string | undefined;
}

export type NotesFolder = {
    id: string;
    name: string;
    created: number;
    creator: Creator;
    sharedWith: string[];
    parentFolderId?: string | undefined;
    updated?: number | undefined;
    fromServer?: boolean | undefined;
}

export type NoteVersionSource =
    | "auto"
    | "manual"
    | "trash"
    | "restore"
    | "restore-version";

export type NoteVersion = {
    id: string;
    noteId: string;
    projectId?: string;
    title?: string;
    content?: string;
    folderId?: string;
    savedAt: number;
    savedBy?: string;
    source: NoteVersionSource;
    label?: string;
    pinned?: boolean;
}

export type AccessRights = {
    objectId: "project";
    level: "admin" | "user";
};

export type Workspace = {
    name: string,
    id: string,
    created: number,
    description: string,
    members: number,
    lastActive: string,
    activePlanId: "free" | "business" | "enterprise",
    productSettings?: ProductSettings,
    sessionRights: AccessRights & {
        projectUser?: ProjectUser
    },
    session?: {
        projectUid: string
    }
}

export type RefreshTokenResult = {
    success: boolean;
    newIdToken?: string;
    newRefreshToken?: string;
    expiresIn?: number;
    decodedToken?: any;
    error?: string;
}

export type ObjectId = { id: string };

export type Image = {
    id: string;
    type: "image" | "video";
    originUri: string;
    original?: string | undefined;
    s84?: string | undefined;
    s240?: string | undefined;
    s480?: string | undefined;
    s720?: string | undefined;
    s1080?: string | undefined;
    uid?: string | undefined;
    video?: {
        originUri: string,
        originalUrl?: string
    };
}

type AppFileObjectType = "leave" | "payslip";

export type AppFile = {
    id: string;
    url: string;
    size: number;
    creator: Creator;
    created: number;
    updated?: number;
    mimeType: string;
    name?: string;
    type?: "file" | "folder";
    folderId?: string;
    sharedWith?: string[];
    lock?: {
        objectType: AppFileObjectType;
        objectId: string;
    };
}

export type FileShareLinkAccessLevel = "view" | "download";

export type FileShareLink = {
    token: string;
    fileId?: string;
    folderId?: string;
    creator: Creator;
    created: number;
    expiresAt?: number;
    accessLevel: FileShareLinkAccessLevel;
    revoked?: boolean;
    revokedAt?: number;
}

export type CreateFileShareLinkInput = {
    fileId?: string;
    folderId?: string;
    accessLevel?: FileShareLinkAccessLevel;
    expiresAt?: number;
}

export type ResolvedFileShareLink =
    | { type: "file"; link: FileShareLink; file: AppFile }
    | { type: "folder"; link: FileShareLink; folder: AppFile };

export type SavedSignatureType = "drawn" | "typed";

export type SavedSignature = {
    id: string;
    name: string;
    type: SavedSignatureType;
    imageDataUrl: string;
    creator: Creator;
    created: number;
    updated?: number;
}

export type CreateSavedSignatureInput = {
    name: string;
    type: SavedSignatureType;
    imageDataUrl: string;
}

export type UpdateSavedSignatureInput = {
    id: string;
    name?: string;
}

// Sign Requests

export type SignFieldType = "signature" | "initials" | "text" | "date";

export type SignField = {
    id: string;
    type: SignFieldType;
    pageIndex: number;
    // Normalized 0..1 coordinates relative to the page (top-left origin).
    x: number;
    y: number;
    w: number;
    h: number;
    label?: string;
    required?: boolean;
    value?: string;
    imageDataUrl?: string;
    filledAt?: number;
}

export type SignRequestStatus = "pending" | "signed" | "declined" | "revoked";

export type SignRequestRecipient =
    | { kind: "user"; userId: string }
    | { kind: "email"; email: string; name?: string };

export type SignRequest = {
    id: string;
    fileId: string;
    signedFileId?: string;
    creator: Creator;
    created: number;
    expiresAt?: number;
    recipient: SignRequestRecipient;
    fields: SignField[];
    status: SignRequestStatus;
    token: string;
    message?: string;
    signedAt?: number;
    declinedAt?: number;
    declineReason?: string;
    revokedAt?: number;
}

export type CreateSignRequestInput = {
    fileId: string;
    recipient: SignRequestRecipient;
    fields: SignField[];
    message?: string;
    expiresAt?: number;
}

export type CreatedSignRequestResult = {
    request: SignRequest;
    memberUrl?: string;
    publicUrl?: string;
}

export type ResolvedMemberSignRequest = {
    request: SignRequest;
    file: AppFile;
    canSign: boolean;
}

export type ResolvedPublicSignRequest = {
    request: SignRequest;
    file: AppFile;
    senderName?: string;
}

export type SystemAudio = {
    id: string;
    originUri: string;
    duration: number;
    original?: string | undefined;
    uid?: string | undefined;
    mp3Url?: string | undefined;
    downloadedUri?: string | undefined;
}

export type JobPost = {
    id: string;
    title: string;
    description: string;
    requirements: string[];
    salaryRange?: string | undefined;
    location?: string | undefined;
    skills: {
        id: string;
        name: string;
    }[];
    department?: string | undefined;
    projectId?: string;
    created: number;
    type: "full-time" | "part-time" | "contract";
    status: "closed" | "open";
    creator: {
        sessionUid: string;
        projectUid: string;
        name?: string | undefined;
        created?: number | undefined;
        avatar?: Image;
    };
    salary?: string;
    company?: {
        name: string,
        logoUrl: string,
    }
    industry?: string,
    applied?: boolean,
    questions?: FilteringQuestion[];
    customerId?: string;
    customer?: {
        id?: string,
        name?: string,
        website?: string,
        logoUrl?: string,
        industry?: string,
    };
    analytics: {
        totalViews: number,
        uniqueViews: number,
        totalShared?: number,
        numberOfApplications?: number,
        lastViewedAt: string,
    },
    numberOfPositions?: number;
    deleted?: boolean;
    published?: boolean;
    closingDate?: string;
    saved?: boolean
}

export interface FilteringQuestion {
    id: string;
    question: string;
    type: 'text' | 'boolean' | 'multiple-choice';
    options?: string[]; // For multiple choice questions
    required: boolean;
}

export type ApplicationFile = {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
    creator?: Creator;
}

export type RecruitHistory = {
    created: number;
    creator: {
        sessionUid: string;
        projectUid: string;
        name?: string | undefined;
        created?: number | undefined;
        avatar?: {
            original?: string | undefined;
        } | undefined;
    };
    action: "updatedStatus" | "updated" | "created" | "applied_for_job" | "submitted_to_client" | "deleted";
    previousValue?: string;
    newValue?: string;
}

export type JobApplication = {
    id: string;
    jobId: string;
    applicantId: string;
    applicantName: string;
    email: string;
    resumeUrl: string;
    coverLetter: string;
    status: "pending" | "reviewed" | "interviewed" | "accepted" | "hired" | "rejected";
    appliedAt: number;
    tags: string[];
    creator: Creator; // This comes from ObjectCreatorSchema
    created: number; // This comes from CreatedSchema
    updated?: number; // Optional, from CreatedSchema,

    phone?: string;
    currentLocation?: string;
    currentCompany?: string;
    linkedinUrl?: string;
    twitterUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
    statusChangeMessage?: string;
    skills: RecruitSkill[],
    jobTitle?: string;
    applicantAvatar?: Image,
    files?: ApplicationFile[];
    resumeFile?: ApplicationFile;
    coverLetterFile?: ApplicationFile;
    jobPost?: JobPost,
    questionResponses?: Record<string, string>;
    sessionUid?: string;
    user?: {
        avatar?: Image;
    },
    type: "manual" | "associated",
    historyList?: RecruitHistory[],
}

export type EventGuest = {
    email: string;
    optional: boolean;
    name: string
};

export type CalendarEventType = "event" | "appointment_schedule";

export type CalenderEvent = {
    type: CalendarEventType;
    id: string;
    created: number;
    start: string;
    end: string;
    hours?: number;
    note: string;
    totalTime: number;
    date: string;
    assigneeName?: string;
    assigneeId?: string;
    assignee?: {
        avatar?: {
            original?: string;
        };
    },
    // Account Session Id
    reporterId: string;
    object?: {
        type: "Task" | "shift" | "jobApplication";
        id: string;
    };
    creator: Creator;
    duration: number;
    title: string;
    guests?: EventGuest[];
    description: string;
};

export type ProjectCompany = {
    address: string; // max 500 chars
    name: string; // min 1, max 100 chars
    vatNumber?: number; // non-negative
    id: string,
    logo?: Image;
    industry?: string;
    companySize?: string;
    location?: string;
    website?: string; // URL format
    description?: string;
    size?: string;
    brand?: {
        themeColors?: {
            primary: string;
            secondary: string;
            accent: string;
        };
    };
    contactDetails?: {
        email?: string;
        phoneNumber?: string;
    }
}

export type ApiValidatorResult = {
    message: string;
    passed: boolean;
    path?: string;
};

export type ValidationResult = {
    success: boolean;
    error?: string;
};

export const processValidation = <T>(value: T, schema: z.ZodUnion<any> | z.ZodObject<any> | z.ZodArray<any>): ApiValidatorResult => {
    try {
        schema.parse(value);
        return {
            passed: true, message: "",
        };
    } catch (error: any) {
        const json = JSON.parse(error.message);
        const result = json[0];
        const message = result.message;
        const path = result.path;
        console.log('errorPath', path);
        return { passed: false, message, path };
    }
}

// Bookings

export type BookingStatus = "confirmed" | "pending" | "cancelled";

export type Booking = {
    id: string;
    creator: Creator;
    created: number;
    updated?: number;
    title: string;
    resourceType?: string;
    resource: string;
    attendee?: string;
    attendeeEmail?: string;
    location?: string;
    status: BookingStatus;
    start: number;
    end: number;
    notes?: string;
    fromServer?: boolean;
};

export type BookingResource = {
    id: string;
    creator: Creator;
    created: number;
    updated?: number;
    name: string;
    type: string;
    fromServer?: boolean;
};

export type BookingResourceGroup = {
    id: string;
    creator: Creator;
    created: number;
    updated?: number;
    label: string;
    iconKey?: string;
    builtin?: boolean;
    active?: boolean;
    fromServer?: boolean;
};
