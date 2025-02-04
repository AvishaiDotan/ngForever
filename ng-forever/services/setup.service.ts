import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { ILoggerService } from '../base/logger.service';

class SetupService {
  private static instance: SetupService;
  private _loggerService: ILoggerService;
  private config: any;

  private constructor(private loggerService: ILoggerService) {
    this._loggerService = loggerService;
    this.config = {};
  }

  public static getInstance(loggerService: ILoggerService): SetupService {
    if (!SetupService.instance) {
      SetupService.instance = new SetupService(loggerService);
    }
    return SetupService.instance;
  }

  private async identifyAngularVersion(): Promise<[Error | null, string | null]> {
    this._loggerService.info('Checking for Angular version...');
  
    return new Promise<[Error | null, string | null]>((resolve) => {
      exec('npm list @angular/core', (error: any, stdout: string, stderr: any) => {
        if (error) {
            
          // Enhanced error handling: check if it’s a problem executing the command or missing package
          let errorMessage = 'An unknown error occurred while trying to execute the npm list command';
  
          if (stderr) {
            errorMessage = `Error executing npm list: ${stderr}`;
          } else if (error.message.includes('missing:')) {
            errorMessage = 'Angular is not installed in this project';
          } else if (error.message.includes('ENOENT')) {
            errorMessage = 'npm command not found. Ensure npm is installed and accessible.';
          } else if (error.message.includes('EACCES')) {
            errorMessage = 'Permission denied while executing npm list. Check your permissions.';
          } else {
            errorMessage = `Error executing npm list: ${error.message}`;
          }
  
          // Log the error
          this._loggerService.error(errorMessage);
          resolve([new Error(errorMessage), null]); // Resolve with error and null result
          return;
        }
  
        try {
          const versionMatch = stdout.match(/@angular\/core@(\d+\.\d+\.\d+)/);
  
          if (versionMatch && versionMatch[1]) {
            this._loggerService.info(`Angular version identified: ${versionMatch[1]}`);
            resolve([null, versionMatch[1]]); // Resolve with null error and version
          } else {
            const errorMessage = 'Could not determine Angular version from npm list output';
            this._loggerService.error(errorMessage);
            resolve([new Error(errorMessage), null]); // Resolve with error and null result
          }
        } catch (parseError) {
          const errorMessage = `Error parsing npm output: ${(parseError as Error)?.message}`;
          this._loggerService.error(errorMessage);
          resolve([new Error(errorMessage), null]); // Resolve with error and null result
        }
      });
    });
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
    
    const [error, angularVersion] = await this.identifyAngularVersion();
    if (error) {
      this._loggerService.error('Error identifying Angular version:' + " " + error);
    }
    if (angularVersion) {
      this._loggerService.info(`Angular service identified with version: ${angularVersion}`);
      this.loadConfigFromFile();
    } else {
      this._loggerService.warn('Angular not detected or version not identified.');
      this.loadConfigFromFile(); // Proceed with loading the default or file config
    }

    // Proceed with any other setup tasks here
  }
}


export { SetupService };