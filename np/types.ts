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
    contactPhoneNumber?: string
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
