import * as fs from 'fs';
import * as path from 'path';
import { JobBase } from "../jobs/base/JobBase";
import { ILoggerService, LoggerService } from "../base/logger.service";
import { RunConfigService } from '../base/config.service';
import { FindNgForWithoutTrackByCallbackJob } from '../jobs/FindNgForWithoutTrackByCallbackJob';

interface IScanResult {
    stats: {
        filesScanned: number;
        directoriesScanned: number;
        errors: number;
    };
}

class Reader {
    private static instance: Reader | null = null;
    private filesScanned: number = 0;
    private directoriesScanned: number = 0;
    private errors: number = 0;
    private jobs: JobBase[];
    private log: ILoggerService;

    private constructor(jobs: JobBase[]) {
        this.jobs = jobs;
        this.log = LoggerService.getInstance();
    }

    public static initiate(): IScanResult {
        return Reader.getInstance([new FindNgForWithoutTrackByCallbackJob()]).scan();
    }

    // Singleton getInstance method
    public static getInstance(jobs: JobBase[]): Reader {
        if (!Reader.instance) {
            Reader.instance = new Reader(jobs);
        }
        return Reader.instance;
    }

    // Helper function to format the issue
    private formatIssue(filePath: string, line: number, code: string, isCommented: boolean) {
        return {
            filePath,
            line,
            code: code.trim(),
            isCommented
        };
    }

    // Helper function to scan a directory and get files based on job file types
    private getFilesToScan(dir: string, jobsFileTypes: string[]): string[] {
        let filesToScan: string[] = [];

        let items: string[];
        try {
            items = fs.readdirSync(dir);
            this.log.debug(`Found ${items.length} items in directory "${dir}"`);
        } catch (error: any) {
            this.log.error(`Failed to read directory "${dir}": ${error.message}`);
            this.errors++;
            return filesToScan;
        }

        for (const item of items) {
            const fullPath = path.join(dir, item);

            try {
                const stat = fs.statSync(fullPath);

                if (stat.isDirectory()) {
                    if (item === 'node_modules' || item === '.git' || item === 'dist') {
                        this.log.debug(`Skipping excluded directory: "${item}"`);
                        continue;
                    }
                    this.directoriesScanned++;
                    // Recursively scan subdirectories
                    filesToScan = filesToScan.concat(this.getFilesToScan(fullPath, jobsFileTypes));
                } else {
                    if (jobsFileTypes.some(type => fullPath.endsWith(type))) {
                        filesToScan.push(fullPath);
                    }
                }
            } catch (error: any) {
                this.log.error(`Error processing "${fullPath}": ${error.message}`);
                this.errors++;
            }
        }

        filesToScan.sort((fileA, fileB) => {
            const getExt = (file: any) => {
                if (!file || typeof file !== 'string') return '';
                const parts = file.split('.');
                return parts.length > 1 ? parts?.pop()?.toLowerCase() : '';
            };

            const extA = getExt(fileA);
            const extB = getExt(fileB);

            return (extA && extB) ? extA.localeCompare(extB) : 0;
        });

        return filesToScan;
    }

    // Method to scan the directory and run the jobs on files that match the job criteria
    public scan(): IScanResult {
        const directory = RunConfigService.getInstance().path;
        this.log.info('Starting scan...');

        const jobsFileTypes = this.jobs.map(job => job.fileType);
        const filesToScan = this.getFilesToScan(directory, jobsFileTypes);
        let issueCounter = 0;

        this.jobs.forEach((job) => {

            filesToScan.forEach((file) => {
                this.filesScanned++;
                this.log.debug(`Scanning file: "${file}"`);
                const content = fs.readFileSync(file, 'utf8');

                if (file.endsWith(job.fileType)) {
                    const rawIssues = job.scanLines(content);
                    rawIssues.forEach((issue) => {
                        issueCounter++;
                        const { code, filePath, isCommented, line } = this.formatIssue(file, issue.line, issue.code, issue.isCommented);
                        this.log.logIssue(issueCounter, filePath, line, code);
                        if (isCommented) {
                            this.log.warn('    Note: This issue is in commented code');
                        }
                    });
                }

            });
            if (issueCounter !== 0 && RunConfigService.getInstance().showFixSuggestion) {
                this.log.logFixSuggestion(job.description, job.fixSuggestion);
            }
        });


        return {
            stats: {
                filesScanned: this.filesScanned,
                directoriesScanned: this.directoriesScanned,
                errors: this.errors
            }
        };
    }
}

export { Reader, IScanResult as ScanResult };
