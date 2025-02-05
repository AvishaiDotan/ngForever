export type Issue = {
    line: number;
    code: string;
    isCommented: boolean;
};

interface IJobConfig {
    skipCommented: boolean;
    fileType: string;
    fixSuggestion: string[];
    supportedVersions: string[];
    description: string;
}

export class JobBase {
    skipCommented: boolean;
    fileType: string;
    fixSuggestion: string[] = [];
    supportedVersions: string[] = [];
    description: string = "";

    constructor({ skipCommented, fileType, fixSuggestion, supportedVersions, description }: IJobConfig) {
        this.skipCommented = skipCommented;
        this.fileType = fileType;
        this.fixSuggestion = fixSuggestion;
        this.supportedVersions = supportedVersions;
        this.description = description;
    }

    // Utility function to check if the line should be processed
    shouldCheckLine(line: string, insideComment: boolean): { shouldCheck: boolean; updatedInsideComment: boolean } {
        const isLineCommented = line.trim().startsWith('<!--') || line.trim().endsWith('-->');
        if (line.includes('<!--')) {
            insideComment = true;
        }

        const check = this.skipCommented ? !insideComment && !isLineCommented : true;
        if (line.includes('-->')) {
            insideComment = false;
        }

        return { shouldCheck: check, updatedInsideComment: insideComment };
    }

    // Common logic for scanning lines in a file
    scanLines(fileContent: string): Issue[] {
        const issues: Issue[] = [];
        let insideComment = false;
        const lines = fileContent.split('\n');

        lines.forEach((line, index) => {
            const { shouldCheck, updatedInsideComment } = this.shouldCheckLine(line, insideComment);
            insideComment = updatedInsideComment;

            if (shouldCheck) {
                const issue = this.processLine(line, index + 1);
                if (issue) {
                    issues.push(issue);
                }
            }
        });

        return issues;
    }

    // Abstract method for specific job logic (to be implemented in subclasses)
    processLine(line: string, lineNumber: number): Issue | null {
        throw new Error('processLine method should be implemented in the subclass');
    }
}
