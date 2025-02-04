import { LogLevel } from "./logger.service";

export interface CliParserConfig {
    path: string;
    logLevel: LogLevel;
    skipCommented: boolean;
    [key: string]: any;
}

export class CliParserService {
    private static instance: CliParserService;
    private config: CliParserConfig;

    private constructor() {
        this.config = this.parse(process.argv);
    }

    public static getInstance(): CliParserService {
        if (!CliParserService.instance) {
            CliParserService.instance = new CliParserService();
        }
        return CliParserService.instance;
    }

    public parse(argv: string[]): CliParserConfig {
        const config: CliParserConfig = {
            path: process.cwd(),
            logLevel: LogLevel.INFO,
            skipCommented: false,
        };

        for (let i = 2; i < argv.length; i++) {
            if (argv[i].startsWith("--")) {
                const key = argv[i].substring(2);
                const value = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : "true";
                config[key] = this.parseValue(value);
                if (argv[i + 1] && !argv[i + 1].startsWith("--")) i++;
            }
        }

        config.path = config.path || process.cwd();
        config.logLevel = (config.logLevel as LogLevel) || LogLevel.INFO;
        config.skipCommented = config.skipCommented === true;

        return config;
    }

    private parseValue(value: string): any {
        if (value === "true") return true;
        if (value === "false") return false;
        if (!isNaN(Number(value))) return Number(value);
        return value;
    }

    public getConfig(): CliParserConfig {
        return this.config;
    }
}
