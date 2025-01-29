# ngForever

🔍 Keep your Angular apps fast by never forgetting trackBy in your *ngFor directives!

## Quick Start with npx

The fastest way to use ngForever is with npx - no installation needed:

```bash
npx ng-forever
```

## Parameters

### Path Selection
```bash
npx ng-forever --path "./my-angular-project"
```
- `--path`: Specify which directory to scan (default: current directory)

### Log Levels
```bash
npx ng-forever --log-level DEBUG
```
Available levels:
- `ERROR`: Only show errors
- `WARN`: Show errors and warnings
- `INFO`: Normal output (default)
- `DETAIL`: Detailed information
- `DEBUG`: All debug information

### Comment Handling
```bash
npx ng-forever --skip-commented
```
- `--skip-commented`: Ignore *ngFor directives in commented code
- By default, the tool will check commented code and warn about missing trackBy
- This is useful because commented code might be re-enabled later

Example of commented code that will be checked by default:
```html
<!-- TODO: Re-enable later
  <div *ngFor="let item of items">
    {{item}}
  </div>
-->
```

## Examples

1. Basic scan of current directory:
```bash
npx ng-forever
```

2. Detailed scan of specific path:
```bash
npx ng-forever --path "./src/app" --log-level DETAIL
```

3. Ignore commented code with minimal output:
```bash
npx ng-forever --skip-commented --log-level ERROR
```

## Global Installation (Alternative)

If you prefer having the tool always available:

```bash
# Install globally
npm install -g ng-forever

# Then use anywhere
ng-forever
```

## Example Output

```bash
[INFO] Starting ngForever Analyzer
[DETAIL] Target path: ./src/app
[WARNING] Found issues in: ./src/app/home.component.html
    File: ./src/app/home.component.html
    Line: 15
    Code: <div *ngFor="let item of items">
```

## Why use trackBy?

Angular's `*ngFor` with `trackBy` can significantly improve performance by helping Angular identify which items have changed. Without `trackBy`, Angular may unnecessarily recreate DOM elements when the reference to your array changes.

## Using in CI/CD

Add to your CI pipeline:
```bash
# Package.json script
"check-ngfor": "npx ng-forever --log-level ERROR"

# Or directly in CI config
- run: npx ng-forever --log-level ERROR --skip-commented
```

## License

MIT