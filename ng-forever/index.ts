import { LoggerService, LogLevel } from "./base/logger.service";
import { SetupService } from "./services/setup.service";
import { Reader } from "./reader/index";
import { RunConfigService, IRunConfigService } from "./base/config.service";

// CliConfig
import { CliParserService } from "./base/cli-parser.service";
CliParserService.initiate();

const loggerService = LoggerService.getInstance();
loggerService.logConfig(RunConfigService.getInstance());

loggerService.logWelcome();
SetupService.getInstance().initiate();

async function run() {
    try {
        const stats = await Reader.initiate();
        loggerService.logStats(stats);

    } catch (error: any) {

    }
}

run();



