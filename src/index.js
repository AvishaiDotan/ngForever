"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_service_1 = require("./base/logger.service");
const inquirer_service_1 = require("./base/inquirer.service");
const setup_service_1 = require("./services/setup.service");
const index_1 = require("./reader/index");
// Jobs
const FindNgForWithoutTrackByCallbackJob_1 = require("./jobs/FindNgForWithoutTrackByCallbackJob");
// CliConfig
const cli_parser_service_1 = require("./base/cli-parser.service");
const cliParserConfig = cli_parser_service_1.CliParserService.getInstance().getConfig();
console.log("🚀 ~ cliParserConfig:", cliParserConfig);
const loggerService = logger_service_1.LoggerService.getInstance(cliParserConfig.logLevel);
const inquiryService = inquirer_service_1.InquiryService;
const setupService = setup_service_1.SetupService.getInstance(loggerService);
setupService.initialize();
const reader = index_1.Reader.getInstance([new FindNgForWithoutTrackByCallbackJob_1.FindNgForWithoutTrackByCallbackJob({ skipCommented: cliParserConfig.skipCommented })], loggerService);
const result = reader.scan(cliParserConfig.path);
