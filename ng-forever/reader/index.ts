import * as fs from 'fs';
import * as path from 'path';
import * as puppeteer from 'puppeteer';
import { JobBase } from "../jobs/base/JobBase";
import { ILoggerService, LoggerService } from "../base/logger.service";
import { RunConfigService } from '../base/config.service';
import { FindNgForWithoutTrackByCallbackJob } from '../jobs/FindNgForWithoutTrackByCallbackJob';
import * as semver from 'semver';
import { IIssueData, IReportData, IFixSuggestion, ReporterService } from '../reporter/reporter.service';

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

    public static async initiate(): Promise<IScanResult> {
        return await Reader.getInstance([new FindNgForWithoutTrackByCallbackJob()]).scan();
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
    public async scan(): Promise<IScanResult> {
        const directory = RunConfigService.getInstance().path;
        this.log.info('Starting scan...');

        const jobsFileTypes = this.jobs.map(job => job.fileType);
        const filesToScan = this.getFilesToScan(directory, jobsFileTypes);
        let issueCounter = 0;

        const reports: IReportData[] = [];
        this.jobs.forEach((job) => {
            const issues: IIssueData[] = []
            let fixSuggestion: IFixSuggestion | undefined;
            if (this.isVersionValid(RunConfigService.getInstance().angularVersion, job.supportedVersions)) {
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
                            issues.push({ code, filePath, line });
                        });
                    }

                });
                if (issueCounter !== 0 && RunConfigService.getInstance().showFixSuggestion) {
                    this.log.logFixSuggestion(job.description, job.fixSuggestion);
                    fixSuggestion = {
                        description: job.description,
                        suggestions: job.fixSuggestion
                    }
                }
                reports.push({ issues, fixSuggestion });
            } else {
                this.log.warn(`Skipping job "${job.description}" as it is not valid for the current version`);
            }
        });

        if (RunConfigService.getInstance().exportPdf) {
            const html = ReporterService.getInstance().exportReport(reports);
            await this.exportPdf(html, RunConfigService.getInstance().path);
        }


        return {
            stats: {
                filesScanned: this.filesScanned,
                directoriesScanned: this.directoriesScanned,
                errors: this.errors
            }
        };
    }

    private isVersionValid(currentVersion: string, validRanges: string[]): boolean {
        // Check if current version satisfies any of the valid ranges
        return validRanges.some(range => semver.satisfies(currentVersion, range));
    }

    private async exportPdf(
        htmlContent: string,
        outputPath: string
    ): Promise<void> {
        try {
            const browser = await puppeteer.launch({
                headless: true,
            });
            const page = await browser.newPage();

            await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
            await page.pdf({
                path: outputPath + '/ng-forever-report.pdf',
                format: 'A4',
                printBackground: true
            });

            await browser.close();
            this.log.info('PDF created successfully');
        } catch (error: any) {
            this.log.error('PDF conversion failed:' + error?.message);
        }
    }

}

export { Reader, IScanResult as ScanResult };
