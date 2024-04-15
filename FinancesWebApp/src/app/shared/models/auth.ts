export interface Login {
    email: string;
    password: string;
    twoFactorCode: string;
    twoFactorRecoveryCode: string;
}

export interface Register {
    email: string;
    password: string;
}

export interface TokenResult {
    tokenType: string,
    accessToken: string,
    expiresIn: 0,
    refreshToken: string,
}