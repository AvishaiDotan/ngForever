"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_service_1 = require("./base/logger.service");
const setup_service_1 = require("./services/setup.service");
const index_1 = require("./reader/index");
const config_service_1 = require("./base/config.service");
// CliConfig
const cli_parser_service_1 = require("./base/cli-parser.service");
cli_parser_service_1.CliParserService.initiate();
const loggerService = logger_service_1.LoggerService.getInstance();
loggerService.logConfig(config_service_1.RunConfigService.getInstance());
loggerService.logWelcome();
setup_service_1.SetupService.getInstance().initiate();
const stats = index_1.Reader.initiate();
loggerService.logStats(stats);
