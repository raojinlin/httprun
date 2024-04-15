import { CommandItem, CommandOutputResponse, CreateCommandResponse, Environment, Param } from "./type";

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
}


const commandService = new CommandService();
export default commandService;