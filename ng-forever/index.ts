import { LoggerService, LogLevel } from "./base/logger.service";
import { InquiryService } from "./base/inquirer.service";
import { SetupService } from "./services/setup.service";
import { Reader } from "./reader/index";
import { RunConfigService, IRunConfigService } from "./base/config.service";

// Jobs
import { FindNgForWithoutTrackByCallbackJob } from "./jobs/FindNgForWithoutTrackByCallbackJob";

// CliConfig
import { CliParserService } from "./base/cli-parser.service";
CliParserService.initiate();

const loggerService = LoggerService.getInstance();
loggerService.logConfig(RunConfigService.getInstance());

loggerService.logWelcome();
SetupService.getInstance().initiate();


const stats = Reader.initiate();
loggerService.logStats(stats);


