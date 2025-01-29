const fs = require('fs');
const path = require('path');

// Log levels
const LOG_LEVELS = {
    ERROR: 0,   // Only errors
    WARN: 1,    // Errors and warnings
    INFO: 2,    // Normal output
    DETAIL: 3,  // Detailed information
    DEBUG: 4    // All debug information
};

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

// Parse command line arguments
function parseArgs() {
    const args = process.argv.slice(2);
    const config = {
        path: '.',
        logLevel: LOG_LEVELS.INFO,  // Default log level
        skipCommented: false        // Default to checking commented code
    };

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--path' && args[i + 1]) {
            config.path = args[i + 1];
            i++;
        } else if (args[i] === '--log-level' && args[i + 1]) {
            const level = args[i + 1].toUpperCase();
            if (LOG_LEVELS[level] !== undefined) {
                config.logLevel = LOG_LEVELS[level];
            } else {
                console.error(`Invalid log level: ${args[i + 1]}`);
                console.error(`Valid levels are: ${Object.keys(LOG_LEVELS).join(', ')}`);
                process.exit(1);
            }
            i++;
        } else if (args[i] === '--skip-commented') {
            config.skipCommented = true;
        }
    }

    return config;
}

// Logging utility
function createLogger(currentLogLevel) {
    return {
        error: (msg) => {
            if (currentLogLevel >= LOG_LEVELS.ERROR) {
                console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`);
            }
        },
        warn: (msg) => {
            if (currentLogLevel >= LOG_LEVELS.WARN) {
                console.log(`${colors.yellow}[WARNING]${colors.reset} ${msg}`);
            }
        },
        info: (msg) => {
            if (currentLogLevel >= LOG_LEVELS.INFO) {
                console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`);
            }
        },
        detail: (msg) => {
            if (currentLogLevel >= LOG_LEVELS.DETAIL) {
                console.log(`${colors.magenta}[DETAIL]${colors.reset} ${msg}`);
            }
        },
        debug: (msg) => {
            if (currentLogLevel >= LOG_LEVELS.DEBUG) {
                console.log(`${colors.cyan}[DEBUG]${colors.reset} ${msg}`);
            }
        },
        always: (msg) => console.log(msg) // Always prints regardless of log level
    };
}

function isLineCommented(line) {
    const trimmedLine = line.trim();
    return trimmedLine.startsWith('<!--') || trimmedLine.endsWith('-->');
}

function findNgForWithoutTrackBy(directory, log, skipCommented = false) {
    const issues = [];
    let filesScanned = 0;
    let directoriesScanned = 0;
    let errors = 0;

    function scanDirectory(dir) {
        directoriesScanned++;
        log.debug(`Scanning directory: "${dir}"`);
        
        let items;
        try {
            items = fs.readdirSync(dir);
            log.detail(`Found ${items.length} items in directory "${dir}"`);
        } catch (error) {
            log.error(`Failed to read directory "${dir}": ${error.message}`);
            errors++;
            return;
        }
        
        for (const item of items) {
            const fullPath = path.join(dir, item);
            
            try {
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    if (item === 'node_modules' || item === '.git' || item === 'dist') {
                        log.debug(`Skipping excluded directory: "${item}"`);
                        continue;
                    }
                    scanDirectory(fullPath);
                } else if (item.endsWith('.html')) {
                    filesScanned++;
                    log.detail(`Scanning HTML file: "${fullPath}"`);
                    
                    const content = fs.readFileSync(fullPath, 'utf8');
                    const lines = content.split('\n');
                    let fileHasIssues = false;
                    let insideComment = false;
                    
                    lines.forEach((line, index) => {
                        // Check for multi-line comment start
                        if (line.includes('<!--')) {
                            insideComment = true;
                        }

                        const shouldCheck = skipCommented ? 
                            (!insideComment && !isLineCommented(line)) : true;

                        if (shouldCheck && line.includes('*ngFor=') && !line.includes('trackBy')) {
                            if (!fileHasIssues) {
                                log.warn(`Found issues in: "${fullPath}"`);
                                fileHasIssues = true;
                            }

                            const isCommented = insideComment || isLineCommented(line);
                            issues.push({
                                file: fullPath,
                                line: index + 1,
                                code: line.trim(),
                                isCommented
                            });
                        }

                        // Check for multi-line comment end
                        if (line.includes('-->')) {
                            insideComment = false;
                        }
                    });
                    
                    if (!fileHasIssues) {
                        log.debug(`No issues found in: "${fullPath}"`);
                    }
                }
            } catch (error) {
                log.error(`Error processing "${fullPath}": ${error.message}`);
                errors++;
            }
        }
    }

    log.info('Starting scan...');
    scanDirectory(directory);
    
    return {
        issues,
        stats: {
            filesScanned,
            directoriesScanned,
            errors
        }
    };
}

function run() {
    const config = parseArgs();
    const log = createLogger(config.logLevel);

    log.info('Starting NgFor TrackBy Analyzer');
    log.detail(`Log level: ${Object.keys(LOG_LEVELS)[config.logLevel]}`);
    log.detail(`Target path: ${config.path}`);
    
    if (config.skipCommented) {
        log.detail('Skipping commented code checks');
    } else {
        log.warn('Checking commented code - use --skip-commented to ignore commented *ngFor');
    }

    if (!fs.existsSync(config.path)) {
        log.error(`Path does not exist: "${config.path}"`);
        process.exit(1);
    }

    const { issues, stats } = findNgForWithoutTrackBy(config.path, log, config.skipCommented);

    // Print summary
    log.info('Scan Complete - Summary:');
    log.detail(`Directories scanned: ${stats.directoriesScanned}`);
    log.detail(`Files scanned: ${stats.filesScanned}`);
    log.detail(`Errors encountered: ${stats.errors}`);
    log.info(`Issues found: ${issues.length}`);

    if (issues.length === 0) {
        log.info('No *ngFor without trackBy found');
    } else {
        log.warn(`Found ${issues.length} *ngFor without trackBy:`);
        
        issues.forEach(({ file, line, code, isCommented }, index) => {
            log.warn(`Issue #${index + 1}:`);
            log.always(`    File: ${file}`);
            log.always(`    Line: ${line}`);
            log.always(`    Code: ${code}`);
            if (isCommented) {
                log.warn('    Note: This issue is in commented code');
            }
            log.always(''); // Empty line
        });
        
        log.info('How to fix these issues:');
        log.always(`    1. Add a trackBy function to your component:
            trackById(index: number, item: any) {
              return item.id; // Replace with appropriate tracking property
            }
        `);
        log.always(`    2. Update your template:
            Before: *ngFor="let item of items"
            After:  *ngFor="let item of items; trackBy: trackById"
        `);
    }

    // Final status
    if (stats.errors > 0) {
        log.warn(`Scan completed with ${stats.errors} errors`);
    } else {
        log.info('Scan completed successfully');
    }
}

module.exports = { run };