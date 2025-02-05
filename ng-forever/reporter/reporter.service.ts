import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { LoggerService } from '../base/logger.service';

export interface IIssueData {
    filePath: string;
    line: number;
    code: string;
}

export interface IFixSuggestion {
    description: string;
    suggestions: string[];
}

export interface IReportData {
    issues: IIssueData[];
    fixSuggestion?: IFixSuggestion;
}

export class ReporterService {
    private template!: HandlebarsTemplateDelegate;
    private static instance: ReporterService;

    constructor(private logger = LoggerService.getInstance()) {
        Handlebars.registerHelper('add', (value: number) => value + 1);
        this.initializeTemplate();
    }

    public exportReport(data: IReportData[]): string {
        try {
            const templateData = {
                reports: data.map((report, index) => ({
                    ...report,
                    reportIndex: index + 1
                }))
            };
            const html = this.template(templateData);
            return html;
        } catch (error: any) {
            this.logger.error(`Export failed: ${error.message}`);
            return '';
        }
    }

    public static getInstance(): ReporterService {
        if (!ReporterService.instance) {
            ReporterService.instance = new ReporterService();
        }
        return ReporterService.instance;
    }

    private initializeTemplate(): void {
        const templatePath = path.join(__dirname, '..', '..', 'ng-forever', 'reporter', 'report.html');
        
        if (!fs.existsSync(templatePath)) {
            this.logger.error(`Template file not found at: ${templatePath}`);
        }

        const templateContent = fs.readFileSync(templatePath, 'utf-8');
        
        try {
            this.template = Handlebars.compile(templateContent);
        } catch (error: any) {
            this.logger.error(`Failed to compile template: ${error?.message}`);
        }
    }
}