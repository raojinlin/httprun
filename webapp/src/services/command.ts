import { AccessLogListResponse, CommandItem, CommandOutputResponse, CreateCommandResponse, CreateTokenRequest, Environment, Param, TokenListResponse } from "./type";

export class CommandService {
    async getCommandList(): Promise<CommandItem[]> {
        const resp = await fetch('/api/admin/commands');
        return await resp.json();
    }

    async run(name: string, params: Param[], env: Environment[]): Promise<CommandOutputResponse> {
        const res = await fetch('/api/run', {
            headers: {
                'content-type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({
                name,
                params,
                env
            })
        });
        return await res.json();
    }

    async create(commandItem: CommandItem): Promise<CreateCommandResponse> {
        const res = await fetch('/api/admin/command', {
            method: 'POST',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify(commandItem),
        });


        return await res.json();
    }

    async delete(name: string[]): Promise<any> {
        const res = await fetch(`/api/admin/commands?name=${name.join(',')}`, {
            method: 'DELETE',
        })
    } 

    async accesslog(pageIndex: number, pageSize: number): Promise<AccessLogListResponse> {
        const res = await fetch(`/api/admin/accesslog?pageIndex=${pageIndex}&pageSize=${pageSize}`);
        return await res.json();
    }

    async deleteAccessLog(id: number): Promise<{id: number}> {
        const res = await fetch(`/api/admin/accesslog?id=${id}`, {method: 'DELETE'})
        return await res.json();
    }

    async getTokenList(pageIndex: number, pageSize: number): Promise<TokenListResponse> {
        const res = await fetch(`/api/admin/tokens?pageIndex=${pageIndex}&pageSize=${pageSize}`);
        return await res.json();
    }

    async deleteToken(id: number): Promise<{id: number}> {
        const res = await fetch(`/api/admin/tokens?id=${id}`, {method: 'DELETE'})
        return await res.json();
    }

    async addToken(req: CreateTokenRequest): Promise<{token: string}> {
        const res = await fetch('/api/admin/token', {
            method: 'POST',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify(req),
        })
        return await res.json();
    }
}


const commandService = new CommandService();
export default commandService;