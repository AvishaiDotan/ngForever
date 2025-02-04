import * as fs from 'fs';
import * as path from 'path';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { ILoggerService } from '../base/logger.service';
import { ConfigService } from '../base/config.service';
class SetupService {
  private static instance: SetupService;
  private _loggerService: ILoggerService;
  private config: any;
  private path: string | undefined = undefined;

  private constructor(private loggerService: ILoggerService, path?: string) {
    this._loggerService = loggerService;
    this.config = {};
    this.path = path;
  }

  public static getInstance(loggerService: ILoggerService, path: string): SetupService {
    if (!SetupService.instance) {
      SetupService.instance = new SetupService(loggerService, path);
    }
    return SetupService.instance;
  }

  private identifyAngularVersion(): string | null {
    const path = this.path || process.cwd();
    this._loggerService.info('Checking for package.json in the current directory...');

    const packageJsonPath = join(path, 'package.json');

    if (!existsSync(packageJsonPath)) {
      this._loggerService.warn('No package.json found. This may not be a Node.js project.');
      return null;
    }

    try {
      this._loggerService.debug('package.json found. Reading file...');
      const packageJsonContent = readFileSync(packageJsonPath, 'utf-8');

      this._loggerService.debug('Parsing package.json...');
      const packageJson = JSON.parse(packageJsonContent);

      if (!packageJson || typeof packageJson !== 'object') {
        this._loggerService.error('Error: Invalid package.json format.');
        return null;
      }

      this._loggerService.info('Looking for Angular version in dependencies...');
      const angularCoreVersion: string | undefined =
        packageJson.dependencies?.['@angular/core'] ||
        packageJson.devDependencies?.['@angular/core'];

      if (angularCoreVersion && typeof angularCoreVersion === 'string') {
        const cleanedVersion = angularCoreVersion.replace(/^[^0-9]+/, ''); // Remove caret, tilde, etc.
        this._loggerService.info(`Angular version detected: ${cleanedVersion}`);
        return cleanedVersion;
      } else {
        this._loggerService.warn('No Angular dependencies found. This may not be an Angular project.');
        return null;
      }
    } catch (error) {
      this._loggerService.warn('Error reading or parsing package.json:' + (error as Error).message);
      return null;
    }
  }


  private loadConfigFromFile(): void {
    const configPath = path.resolve('ng-forever.json');
    if (fs.existsSync(configPath)) {
      try {
        const fileConfig = fs.readFileSync(configPath, 'utf8');
        this.config = JSON.parse(fileConfig);
        this._loggerService.info('Loaded config from ng-forever.json');
      } catch (error) {
        this._loggerService.error('Failed to parse ng-forever.json, using default config.');
        this.config = this.getDefaultConfig();
      }
    } else {
      this._loggerService.info('ng-forever.json not found, using default config.');
      this.config = this.getDefaultConfig();
    }
  }

  private getDefaultConfig(): any {
    return {

    };
  }

  public async initialize(): Promise<void> {

    this._loggerService.printWelcome();
    this._loggerService.info('Identifying system variables...');

    const angularVersion = this.identifyAngularVersion();
    this._loggerService.debug('Setting up configuration...');

    ConfigService.getInstance().angularVersion = angularVersion;
    
    if (angularVersion) {
      this.loadConfigFromFile();
    } else {
      this._loggerService.warn('Angular not detected or version not identified.');
      this.loadConfigFromFile(); // Proceed with loading the default or file config
    }

    // Proceed with any other setup tasks here
  }
}


export { SetupService };