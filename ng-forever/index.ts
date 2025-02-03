import { LoggerService, LogLevel } from "./base/logger.service";
import { InquiryService } from "./base/inquirer.service";
import { SetupService } from "./services/setup.service";
import { Reader } from "./reader/index";

import { FindNgForWithoutTrackByCallbackJob } from "./jobs/FindNgForWithoutTrackByCallbackJob";


const loggerService = LoggerService.getInstance(LogLevel.DEBUG);
const inquiryService = InquiryService;
const setupService = SetupService.getInstance(loggerService);

setupService.initialize();

const reader = Reader.getInstance([new FindNgForWithoutTrackByCallbackJob({skipCommented: true})], loggerService);
console.log("🚀 ~ reader:", reader)
const result = reader.scan('/path/to/directory');
console.log(result);


