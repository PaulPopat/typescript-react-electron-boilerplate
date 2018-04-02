import { ipcMain, ipcRenderer } from "electron";

export class Renderer {
    public static send(channel: string, args?: any): void {
        ipcRenderer.send(channel, args);
    }

    public static get<TReturn>(channel: string): Promise<TReturn> {
        return new Promise<TReturn>((resolve) => {
            ipcRenderer.once(channel, (event, data: TReturn) => {
                resolve(data);
            });
        });
    }

    public static request<TReturn>(channel: string, args?: any): Promise<TReturn> {
        this.send(channel, args);
        return this.get<TReturn>(channel);
    }

    public static on<TReturn>(channel: string, handle: (data: TReturn) => Promise<any>): void {
        ipcRenderer.on(channel, async (event, data: TReturn) => {
            const result = await handle(data);
            this.send(channel, result);
        });
    }
}

export class Main {
    public constructor(private content: Electron.WebContents) {}

    public send(channel: string, args?: any): void {
        this.content.send(channel, args);
    }

    public get<TReturn>(channel: string): Promise<TReturn> {
        return new Promise<TReturn>((resolve) => {
            ipcMain.once(channel, (event, data: TReturn) => {
                resolve(data);
            });
        });
    }

    public request<TReturn>(channel: string, args?: any): Promise<TReturn> {
        this.send(channel, args);
        return this.get<TReturn>(channel);
    }

    public on<TReturn>(channel: string, handle: (data: TReturn) => Promise<any>): void {
        ipcMain.on(channel, async (event, data: TReturn) => {
            const result = await handle(data);
            this.send(channel, result);
        });
    }
}
