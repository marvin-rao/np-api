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

export type RecruitSkill = {
    id: string;
    name: string;
    created: number;
    creator: Creator;
    updated?: number | undefined;
    category?: {
        id: string,
        name?: string
    }
    type: "skills" | "openToWorkWithSkills";
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
}

export type Workspace = {
    name: string,
    id: string,
    created: number,
    description: string,
    members: number,
    lastActive: string,
    activePlanId: "free" | "business" | "enterprise",
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
}

export type JobApplication = {
    id: string;
    jobId: string;
    applicantId: string;
    applicantName: string;
    email: string;
    resumeUrl: string;
    coverLetter: string;
    status: "pending" | "reviewed" | "interviewed" | "accepted" | "rejected";
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
    files?: {
        id: string;
        name: string;
        url: string;
        type: string;
        size: number;
    }[];
    jobPost?: JobPost
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
        type: "Task" | "shift";
        id: string;
    };
    creator: Creator;
    duration: number;
    title: string;
    guests?: EventGuest[];
    description: string;
};