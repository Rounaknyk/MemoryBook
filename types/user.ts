export interface UserProfile {
    id: string;
    email: string;
    displayName?: string;
    coupleId?: string;
    inviteCode?: string;
    createdAt: Date;
}

export interface Couple {
    id: string;
    userIds: [string, string];
    partner1Email: string;
    partner2Email: string;
    createdAt: Date;
}

export interface PartnerInfo {
    email: string;
    displayName?: string;
}
