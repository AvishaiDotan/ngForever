# Reporter Option in ngForever

The `--exportPdf` option in `ngForever` allows you to export a beautifully designed PDF report of the analysis results. This feature is useful for generating a professional summary of your Angular application's optimization and convention checks.

## Usage

To export a PDF report, you simply need to include the `--exportPdf` flag when running the `ng-forever` command:

``bash
ng-forever --exportPdf`` 

This will generate a PDF document containing the results of the optimization checks. The PDF is formatted for easy reading, with each issue clearly marked, along with file references and line numbers.

## Example

Running the command:

bash

CopyEdit

`ng-forever --path "src/app" --exportPdf` 

will analyze the Angular project in the `src/app` directory and export the results as a well-formatted PDF.