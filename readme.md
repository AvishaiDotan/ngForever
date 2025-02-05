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
| `--exportPdf` | Exports a designed pdf (More at docs/reporter)  | `false`           |
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

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

To run the app locally for development:

**Option One (Build and Run):**

Bash

```
npm run build
node .dist/index.js --path "some-directory-for-testing"

```

You can add other options as needed. Replace `"some-directory-for-testing"` with the path to the directory you want to analyze.

**Option Two (Debugging):**

Use a debugger (e.g., in your IDE) and update the arguments with the relevant options.

## License

MIT - See LICENSE file for details

## Support

If you encounter any issues or have questions, please file an issue on the GitHub repository.
Example output:
