import { RunConfigService } from "../base/config.service";
import { JobBase, Issue } from "./base/JobBase";

export class FindNgForWithoutTrackByCallbackJob extends JobBase {
    constructor() {
        const skipCommented = RunConfigService.getInstance().skipCommented;
        super({
            skipCommented,
            fileType: 'html',
            fixSuggestion: [
                "    1. Add a trackBy function to your component:\n" +
                "        trackById(index: number, item: any) {\n" +
                "          return item.id; // Replace with appropriate tracking property\n" +
                "        }\n",
            
                "    2. Update your template:\n" +
                "        Before: *ngFor=\"let item of items\"\n" +
                "        After:  *ngFor=\"let item of items; trackBy: trackById\"\n"
            ],
            supportedVersions: ['>=4.0.0'],
            description: `ngFor directive without trackBy callback`
        });
    }

    // Implement the processLine method for this specific job
    processLine(line: string, lineNumber: number): Issue | null {
        if (line.includes('*ngFor=') && !line.includes('trackBy')) {
            return {
                line: lineNumber,
                code: line,
                isCommented: line.trim().startsWith('<!--') || line.trim().endsWith('-->')
            };
        }

        return null; // No issue found in this line
    }
}
