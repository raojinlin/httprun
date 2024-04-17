export type ParamDefine = {
    name: string;
    description: string;
    type: string;
    defaultValue: string|number|boolean|undefined;
    required: boolean;
}

export type Param = {
    name: string;
    value: string;
};

export type Environment = {
    name: string;
    value: string;
}

export type Command = {
    command: string;
    params: ParamDefine[];
    env: Environment[];
};

export type CommandStatus = number;

export type CommandItem =     {
    id: number;
    command: Command;
    path: string;
    name: string;
    status: CommandStatus;
    description: string;
    created_at: string;
    updated_at: string;
};

export type CreateCommandResponse = {
    id: number;
}


export type CommandOutputResponse = {
    stdout: string;
    stderr: string;
    error: string;
}

export type AccessLogItem = {
    id: number;
    token_id: string;
    path: string;
    ip: string;
    request: string;
    response: string;
    created_at: string;
    updated_at: string;
}

export type AccessLogListResponse = {
    items: AccessLogItem[];
    total: number;
}

export type Token = {
    id: number;
    jwt_token: string;
    issue_at: number;
    expires_at: number;
    subject: string;
    name: string;
    created_at: string;
    updated_at: string;
}

export type TokenListResponse = {
    items: Token[];
    total: number;
}

export type CreateTokenRequest = {
    issue_at: number;
    expires_at: number;
    subject: string;
    name: string;
}

export type CreateTokenResponse = {
    token: string;
}