import { LoggerService, LogLevel } from "./base/logger.service";
import { InquiryService } from "./base/inquirer.service";
import { SetupService } from "./services/setup.service";
import { Reader } from "./reader/index";

// Jobs
import { FindNgForWithoutTrackByCallbackJob } from "./jobs/FindNgForWithoutTrackByCallbackJob";

// CliConfig
import { CliParserConfig, CliParserService } from "./base/cli-parser.service";
const cliParserConfig: CliParserConfig = CliParserService.getInstance().getConfig();


const loggerService = LoggerService.getInstance(cliParserConfig.logLevel);
const inquiryService = InquiryService;
const setupService = SetupService.getInstance(loggerService);

setupService.initialize();



const reader = Reader.getInstance([new FindNgForWithoutTrackByCallbackJob({skipCommented: cliParserConfig.skipCommented})], loggerService);
const result = reader.scan(cliParserConfig.path);
loggerService.stats(result);


