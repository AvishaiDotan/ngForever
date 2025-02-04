interface IConfigService {
    angularVersion: string | null;
}

export class ConfigService implements IConfigService {
    private static instance: ConfigService;

    public angularVersion: string | null = null;

    private constructor() {}

    public static getInstance(): ConfigService {
        if (!ConfigService.instance) {
            ConfigService.instance = new ConfigService();
        }
        return ConfigService.instance;
    }
}