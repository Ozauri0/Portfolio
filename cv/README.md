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

## ATS (applicant tracking systems)
Both files are built to be parsed by LinkedIn, Workday, Greenhouse, Lever and similar:
- Single column, no tables, images, icons or text boxes; real text in a standard Times font.
- Standard section headings (Summary, Education, Experience, Leadership, Skills) in plain upper case.
- Dates as `Month YYYY -- Present`; company and job title on separate lines.
- Skills as plain comma-separated keywords, using the same names as job postings.
- pdfLaTeX embeds a Unicode map (`cmap` + `glyphtounicode`), so accents and ligatures are extracted exactly.
- PDF metadata (title, author, language) is set.

Tips when you apply: export the PDF from Overleaf, name it `Christian_Ferrer_CV.pdf` (or `_ES`), and upload that
file. If a form asks you to paste text, copy it from the PDF, not from the `.tex`.

## Voice
All bullets are in first person ("I built...", "Desarrollé..."). Harvard-style resumes normally drop the pronoun;
the English file keeps an explicit "I" on purpose. Delete the "I " at the start of each bullet to switch back.
