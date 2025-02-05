import { RunConfigService } from "./config.service";
import { LogLevel } from "./logger.service";

export class CliParserService {
    private static instance: CliParserService;

    private constructor() {
        const parsedConfig = this.parse(process.argv);
        RunConfigService.getInstance().updateConfig(parsedConfig);
    }

    public static initiate(): void {
        CliParserService.getInstance();
    }

    public static getInstance(): CliParserService {
        if (!CliParserService.instance) {
            CliParserService.instance = new CliParserService();
        }
        return CliParserService.instance;
    }

    public parse(argv: string[]): { [key: string]: any } {
        // Remove first two elements (node path and script path)
        const args = argv.slice(2);
        const config: { [key: string]: any } = {};

        for (let i = 0; i < args.length; i++) {
            const arg = args[i];

            // Check if argument is a parameter (starts with --)
            if (arg.startsWith('--')) {
                const paramName = arg.slice(2); // Remove -- prefix
                const nextArg = args[i + 1];

                // Check if next argument exists and is not another parameter
                if (nextArg && !nextArg.startsWith('--')) {
                    // Try parsing as number
                    const numberValue = Number(nextArg);
                    if (!isNaN(numberValue)) {
                        config[paramName] = numberValue;
                    } else {
                        // If not a number, store as string
                        config[paramName] = nextArg;
                    }
                    i++; // Skip next argument since we've used it as a value
                } else {
                    // No value after parameter, treat as boolean flag
                    config[paramName] = true;
                }
            }
        }

        return config;
    }
}
