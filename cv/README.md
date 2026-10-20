# CV

Compiled resumes served by the site at `/cv/es` and `/cv/en` (the "Download CV" button in the About section picks the
language the visitor is using).

| File | Language |
|---|---|
| `cv-es.pdf` | Español |
| `cv-en.pdf` | English |

To update a CV: export the new PDF from Overleaf, overwrite the file here (keep the name) and redeploy
(`./scripts/deploy.sh`). The files are copied into the Docker image (see the `Dockerfile`).

The LaTeX sources (Harvard format, ATS-friendly, Overleaf compatible) were removed from the repo and stay in the git
history: `git show 788ea61:cv/cv-es.tex` / `git show 788ea61:cv/cv-en.tex`.
