import * as fs from 'fs';
import * as path from 'path';
import { JobBase } from "../jobs/base/JobBase";
import { ILoggerService } from "../base/logger.service";

interface ScanResult {
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

    private constructor(jobs: JobBase[], log: ILoggerService) {
        this.jobs = jobs;
        this.log = log;
    }

    // Singleton getInstance method
    public static getInstance(jobs: JobBase[], log: ILoggerService): Reader {
        if (!Reader.instance) {
            Reader.instance = new Reader(jobs, log);
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
    private getFilesToScan(dir: string): string[] {
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
                    // Recursively scan subdirectories
                    filesToScan = filesToScan.concat(this.getFilesToScan(fullPath));
                } else {
                    filesToScan.push(fullPath);
                }
            } catch (error: any) {
                this.log.error(`Error processing "${fullPath}": ${error.message}`);
                this.errors++;
            }
        }
        return filesToScan;
    }

    // Method to scan the directory and run the jobs on files that match the job criteria
    public scan(directory: string): ScanResult {
        this.log.info('Starting scan...');

        const filesToScan = this.getFilesToScan(directory);
        let issueCounter = 0;
        // Iterate over all files
        filesToScan.forEach((file, i) => {
            this.filesScanned++;
            this.log.debug(`Scanning file: "${file}"`);
            const content = fs.readFileSync(file, 'utf8');

            // Iterate over all jobs and check if the job fileType matches the current file
            this.jobs.forEach((job, k) => {

                if (file.endsWith(job.fileType)) {  // Use job's fileType directly
                    const rawIssues = job.scanLines(content);
                    rawIssues.forEach((issue, j) => {
                        issueCounter++;
                        const {code, filePath,isCommented, line} = this.formatIssue(file, issue.line, issue.code, issue.isCommented);
                        this.log.system(`Issue #${issueCounter}:`);
                        this.log.system(`   File: ${filePath}`);
                        this.log.system(`   Line: ${line}`);
                        this.log.system(`   Code: ${code}`);
                        if (isCommented) {
                            this.log.warn('    Note: This issue is in commented code');
                        }
                        this.log.system(''); // Empty line for readability
                    });
                }

                // job.fixSuggestion?.forEach((suggestion, index) => {
                //     this.log.system(suggestion);
                // })
                
            });
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

export { Reader, ScanResult };
