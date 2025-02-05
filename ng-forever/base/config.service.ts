import { LogLevel } from "./logger.service";

export interface IRunConfigService {
    angularVersion: string;
    skipCommented: boolean;
    logLevel: LogLevel;
    path: string;
    showFixSuggestion: boolean;
}

export class RunConfigService implements IRunConfigService {
    private static instance: RunConfigService;

    public angularVersion: string =  "";
    public skipCommented: boolean = false;
    public logLevel: LogLevel = LogLevel.INFO;
    public path: string = process.cwd();
    public showFixSuggestion: boolean = true;

    private constructor() { }

    public static getInstance(): RunConfigService {
        if (!RunConfigService.instance) {
            RunConfigService.instance = new RunConfigService();
        }
        return RunConfigService.instance;
    }

    public updateConfig(configUpdates: { [key: string]: any }): void {
        Object.keys(configUpdates).forEach((key) => {
            if (key in this) {
                (this as any)[key] = configUpdates[key];
            }
        });
    }
}