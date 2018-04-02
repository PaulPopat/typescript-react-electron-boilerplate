import { ipcMain, ipcRenderer } from "electron";

export class Renderer {
    public static send(channel: string, args: any): void {
        ipcRenderer.send(channel, args);
    }

    public static get<TReturn>(channel: string): Promise<TReturn> {
        return new Promise<TReturn>((resolve) => {
            ipcRenderer.once(channel, (event, data: TReturn) => {
                resolve(data);
            });
        });
    }

    public static request<TReturn>(channel: string, args: any): Promise<TReturn> {
        this.send(channel, args);
        return this.get<TReturn>(channel);
    }

    public static on<TReturn>(channel: string, handle: (data: TReturn) => void): void {
        ipcRenderer.on(channel, (event, data: TReturn) => handle(data));
    }
}

export class Main {
    public static send(content: Electron.WebContents, channel: string, args: any): void {
        content.send(channel, args);
    }

    public static get<TReturn>(channel: string): Promise<TReturn> {
        return new Promise<TReturn>((resolve) => {
            ipcMain.once(channel, (event, data: TReturn) => {
                resolve(data);
            });
        });
    }

    public static request<TReturn>(content: Electron.WebContents, channel: string, args: any): Promise<TReturn> {
        this.send(content, channel, args);
        return this.get<TReturn>(channel);
    }

    public static on<TReturn>(channel: string, handle: (data: TReturn) => void): void {
        ipcMain.on(channel, (event, data: TReturn) => handle(data));
    }
}
