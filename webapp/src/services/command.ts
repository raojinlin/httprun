import { 
    AccessLogListResponse, 
    CommandItem, 
    CommandOutputResponse, 
    CreateCommandResponse, 
    CreateTokenRequest, 
    CreateTokenResponse, 
    Environment, 
    Param, 
    TokenListResponse,
 } from "./type";

export class CommandService {
    async fetch(url: string, options?: RequestInit): Promise<Response> {
        if (!options) {
            options = {};
        }

        options.headers = {'x-token': window.localStorage.getItem('token') || ''};
        const resp = await fetch(url, options);
        if (resp.status === 403) {
            throw new Error(resp.statusText);
        } else if (resp.status !== 200) {
            throw new Error("invalid status code: " + resp.status);
        }

        return resp;
    }

    async getUserCommandList(): Promise<CommandItem[]> {
        const resp = await this.fetch('/api/run/commands');
        return await resp.json();
    }

    async validToken() {
        await this.fetch('/api/run/valid');
    }
    async getCommandList(): Promise<CommandItem[]> {
        const resp = await this.fetch('/api/admin/commands');
        return await resp.json();
    }

    async run(name: string, params: Param[], env: Environment[]): Promise<CommandOutputResponse> {
        const res = await this.fetch('/api/run', {
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
        const res = await this.fetch('/api/admin/command', {
            method: 'POST',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify(commandItem),
        });


        return await res.json();
    }

    async delete(name: string[]): Promise<any> {
        const res = await this.fetch(`/api/admin/commands?name=${name.join(',')}`, {
            method: 'DELETE',
        })
    } 

    async accesslog(pageIndex: number, pageSize: number): Promise<AccessLogListResponse> {
        const res = await this.fetch(`/api/admin/accesslog?pageIndex=${pageIndex}&pageSize=${pageSize}`);
        return await res.json();
    }

    async deleteAccessLog(id: number): Promise<{id: number}> {
        const res = await this.fetch(`/api/admin/accesslog?id=${id}`, {method: 'DELETE'})
        return await res.json();
    }

    async getTokenList(pageIndex: number, pageSize: number): Promise<TokenListResponse> {
        const res = await this.fetch(`/api/admin/tokens?pageIndex=${pageIndex}&pageSize=${pageSize}`);
        return await res.json();
    }

    async deleteToken(id: number): Promise<{id: number}> {
        const res = await this.fetch(`/api/admin/tokens?id=${id}`, {method: 'DELETE'})
        return await res.json();
    }

    async addToken(req: CreateTokenRequest): Promise<CreateTokenResponse> {
        const res = await this.fetch('/api/admin/token', {
            method: 'POST',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify(req),
        })
        return await res.json();
    }
}


const commandService = new CommandService();
export default commandService;