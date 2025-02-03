import { JobBase, Issue } from "./base/JobBase";

export class FindNgForWithoutTrackByCallbackJob extends JobBase {
    constructor({ skipCommented }: { skipCommented: boolean }) {
        super({
            skipCommented,
            fileType: 'html'
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
