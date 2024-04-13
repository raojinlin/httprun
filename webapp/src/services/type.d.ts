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
    id: number,
    command: Command,
    name: string,
    status: CommandStatus,
    description: string,
    created_at: string,
    updated_at: string
};


export type CommandOutputResponse = {
    stdout: string;
    stderr: string;
    error: string;
}