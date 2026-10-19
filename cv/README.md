# CV (Harvard format)

Two one-page resumes in the Harvard Office of Career Services format (education first, reverse-chronological
experience, bullets that start with action verbs, Times serif, no photo):

| File | Language |
|---|---|
| `cv-en.tex` | English |
| `cv-es.tex` | Español |

## Use on Overleaf
1. **New Project > Upload Project** and upload `cv-en.tex` / `cv-es.tex` (or zip this folder), or import the repo from GitHub.
2. Menu > **Compiler: pdfLaTeX** (default). No extra files or fonts are needed: it only uses standard TeX Live packages
   (`mathptmx`, `geometry`, `enumitem`, `titlesec`, `hyperref`, `microtype`, `babel`).
3. Recompile. Search for `TODO` in the files for the details to confirm before sending the CV.

## Compile locally
`pdflatex cv-en.tex` (or `tectonic cv-en.tex`).

## Keep it to one page
The Harvard format expects one page. If you add content, shorten older bullets first.
