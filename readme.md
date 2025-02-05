# ngForever

Angular optimization and convention checker that helps you find and fix common issues in your Angular applications. Works great as a pre-commit hook!

## Features

- 🔍 Automatically detects optimization opportunities
- ⚡ Improves application performance
- 🎯 Enforces best practices and conventions
- 🛠️ Customizable to your project needs
- 📋 Detailed reporting with file and line references

## Installation

You can install ngForever using npm:

```bash
npm install ng-forever
```

Or run it directly using npx:

```bash
npx ng-forever
```

## Usage

Run ngForever in your Angular project directory:

```bash
ng-forever [options]
```

### Command Line Options

| Option               | Description                              | Default           |
|----------------------|------------------------------------------|-------------------|
| `--logLevel`          | Set the logging verbosity               | `INFO`            |
| `--skipCommented`     | Skip checking commented code            | `false`           |
| `--path`              | Set the directory path to check         | Current directory |
| `--showFixSuggestion` | Display suggestions for fixing issues  | `true`           |
### Log Levels

The following log levels are available:
- `INFO`: Standard information
- `WARN`: Warning messages
- `ERROR`: Error messages
- `DEBUG`: Detailed debug information
- `SYSTEM`: System-level messages

## Jobs

ngForever runs a series of jobs to check your Angular application. Each job focuses on specific optimization or convention checks.

### Currently Available Jobs

#### FindNgForWithoutTrackByCallbackJob

Detects `*ngFor` directives that don't implement a `trackBy` callback function, which can lead to performance issues.

Example output:
```
Issue #133
────────────────────────────────────────────────────────────────────────────────
File:    C:\website-row.component.html
Line:    113
Code:    *ngFor="let site of data.flavors"
────────────────────────────────────────────────────────────────────────────────
```

## Best Practices

1. Run ngForever before committing changes to ensure code quality
2. Address all reported issues to maintain optimal application performance
3. Configure the tool according to your project's specific needs

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT - See LICENSE file for details

## Support

If you encounter any issues or have questions, please file an issue on the GitHub repository.
