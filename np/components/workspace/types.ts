export type ProductUserSettingsValue = {
    // UserId
    [index: string]: boolean;
};

export type ProductSettingsValue = {
    enabled: boolean;
    users: ProductUserSettingsValue;
    isPrivate: boolean;
};

export type ProductSettings = {
    // productId
    [index: string]: ProductSettingsValue;
};