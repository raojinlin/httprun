import { CommandItem, CommandOutputResponse, Environment, Param } from "./type";

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
}


const commandService = new CommandService();
export default commandService;