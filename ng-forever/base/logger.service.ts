import chalk from "chalk";
import { ScanResult } from "../reader";
import { RunConfigService } from "./config.service";

enum LogLevel {
	INFO = "INFO",
	WARN = "WARN",
	ERROR = "ERROR",
	DEBUG = "DEBUG",
	SYSTEM = "SYSTEM"
}

export interface ILoggerService {
	logWelcome(): void;
	logIssue(issueNumber: number, file: string, line: number, code: string): void
	logStats(result: ScanResult): void;
	logFixSuggestion(jobDescription: string, fixSuggestions: string[]): void;
	info(message: string): void;
	warn(message: string): void;
	error(message: string): void;
	debug(message: string): void;
	system(message: string): void;
	setLogLevel(level: LogLevel): void;
}

class LoggerService implements ILoggerService {
	private static instance: LoggerService;
	private logLevel: LogLevel;

	private constructor() {
		this.logLevel = RunConfigService.getInstance().logLevel;
	}

	public static initiate(): void {
		LoggerService.getInstance();
	}

	public static getInstance(): LoggerService {
		if (!LoggerService.instance) {
			LoggerService.instance = new LoggerService();
		}
		return LoggerService.instance;
	}

	public logWelcome(): void {
		console.log(chalk.blue(`
              _____                                   
  _ __   __ _|  ___|__  _ __ _____   _____ _ __ 
 | '_ \\ / _\` | |_ / _ \\| '__/ _ \\ \\ / / _ \\ '__|
 | | | | (_| |  _| (_) | | |  __/\\ V /  __/ |   
 |_| |_|\\__, |_|  \\___/|_|  \\___| \\_/ \\___|_|   
        |___/                                   
      `));
	}

	public logFixSuggestion(jobDescription: string, fixSuggestions: string[]): void {
		const separator = chalk.gray('─'.repeat(80));

		console.log('\n' + separator);
		console.log(chalk.green('Fix Suggestion'));
		console.log(separator);
		console.log(chalk.blue('Description: ') + chalk.white(jobDescription));

		if (fixSuggestions.length > 0) {
			console.log(separator);
			console.log(chalk.blue('Suggested Fixes:'));
			fixSuggestions.forEach((suggestion) => {
				console.log(chalk.white(`\n${suggestion}`));
			});
		}

		console.log(separator + '\n');
	}

	public logIssue(issueNumber: number, file: string, line: number, code: string): void {
		const separator = chalk.gray('─'.repeat(80));

		console.log('\n' + separator);
		console.log(chalk.yellow(`Issue #${issueNumber}`));
		console.log(separator);
		console.log(chalk.blue('File:    ') + chalk.white(file));
		console.log(chalk.blue('Line:    ') + chalk.white(line));
		console.log(chalk.blue('Code:    ') + chalk.white(code));
		console.log(separator + '\n');
	}

	public logStats({ stats }: ScanResult): void {
		const separator = chalk.gray('─'.repeat(80));

		console.log('\n' + separator);
		console.log(chalk.cyan('Scan Statistics'));
		console.log(separator);
		console.log(chalk.blue('Files Scanned:       ') + chalk.green(stats.filesScanned.toString()));
		console.log(chalk.blue('Directories Scanned: ') + chalk.green(stats.directoriesScanned.toString()));
		console.log(chalk.blue('Errors Found:        ') +
			(stats.errors > 0 ? chalk.red(stats.errors.toString()) : chalk.green('0')));
		console.log(separator + '\n');
	}
	public logConfig(config: RunConfigService): void {
		if (config.logLevel !== LogLevel.DEBUG) return;

		const separator = chalk.gray('─'.repeat(80));
		console.log('\n' + separator);
		console.log(chalk.cyan('Configuration Settings'));
		console.log(separator);

		// Loop through each key-value pair in the config object
		for (const [key, value] of Object.entries(config)) {
			const label = chalk.blue(key.charAt(0).toUpperCase() + key.slice(1) + ':');
			let displayValue;

			if (typeof value === 'boolean') {
				displayValue = value ? chalk.green('Yes') : chalk.red('No');
			} else if (value) {
				displayValue = chalk.green(value);
			} else {
				displayValue = chalk.yellow('Not Set');
			}

			console.log(label + ' ' + displayValue);
		}

		console.log(separator + '\n');
	}


	private formatMessage(level: LogLevel, message: string): string {
		const timestamp = new Date().toISOString();
		let coloredLevel;

		switch (level) {
			case LogLevel.INFO:
				coloredLevel = chalk.blue(level);
				break;
			case LogLevel.WARN:
				coloredLevel = chalk.yellow(level);
				break;
			case LogLevel.ERROR:
				coloredLevel = chalk.red(level);
				break;
			case LogLevel.DEBUG:
				coloredLevel = chalk.magenta(level);
				break;
			case LogLevel.SYSTEM:
				message = chalk.blue(message);
				return `${message}`;
		}

		return `[${timestamp}] ${coloredLevel}: ${message}`;
	}

	public system(message: string): void {
		console.log(this.formatMessage(LogLevel.SYSTEM, message));
	}

	public info(message: string): void {
		console.log(this.formatMessage(LogLevel.INFO, message));
	}

	public warn(message: string): void {
		if (this.logLevel === LogLevel.WARN || this.logLevel === LogLevel.ERROR || this.logLevel === LogLevel.DEBUG) {
			console.warn(this.formatMessage(LogLevel.WARN, message));
		}
	}

	public error(message: string): void {
		if (this.logLevel === LogLevel.ERROR || this.logLevel === LogLevel.DEBUG) {
			console.error(this.formatMessage(LogLevel.ERROR, message));
		}
	}

	public debug(message: string): void {
		if (this.logLevel === LogLevel.DEBUG) {
			console.debug(this.formatMessage(LogLevel.DEBUG, message));
		}
	}

	public setLogLevel(level: LogLevel): void {
		this.logLevel = level;
	}
}
export { LoggerService, LogLevel };