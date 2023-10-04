# CS310 - Third Year Computer Science Project

This project comprises a web based training platform for future pilots to learn radio telephony (RT) skills required to pass the CAA RT exam in order to obtain a Flight Radiotelephony Operator's License (FRTOL). More information about the licence and exam can be found on the CAA's website:
https://www.caa.co.uk/general-aviation/pilot-licences/flight-radio-telephony-operator-licence/

## The repository

This repository is inspired by a starter pack repository of resources for CS310 and other, similar modules written by Warwick alumni Michael B. Gale (https://github.com/mbg/cs310). It initially comprised of:

- LaTeX templates for the project specification, progress report, and dissertation.
- GitHub Actions workflows for building each report and making them available as build artifacts.
- Generic advice for writing the reports.

### Continuous Integration

This repository is configured with [GitHub Actions](https://docs.github.com/en/actions) workflows which will builds reports every time changes are pushed. For example, if you change `specification/specification.tex` locally, commit your changes, and push them to GitHub, then the workflow defined in `.github/workflows/specification.yml` will run and build your specification for you. If the build is successful, the resulting PDF will be uploaded as a build artifact and can be downloaded from the summary page of the corresponding job.

### Continuous Deployment

Eventually this repository will be linked to a GitHub Pages page and continously deployed there in order to have accessible the current release version of the project

### Compiling locally

You will need to have a LaTeX distribution, such as [TeX Live](https://www.tug.org/texlive/) installed for the platform you are working on. `texlive` is included in the official Arch repo:

```
$ sudo pacman -S texlive
```

The template also supports syntax highlighting using the `minted` package, which requires [Pygments](https://pygments.org) to be installed using e.g. `pip install Pygments` or `pip3 install Pygments` (assuming your platform already has Python installed on it). If this causes you problems or you do not wish to use `minted` for syntax highlighting in your reports, you can remove `\usepackage{minted}` from `common/common.tex`. Alternatively, you can follow the instructions below.

To compile your reports locally, you can use `latexmk` or `pdflatex`. For example, to compile the specification using `latexmk`:

```
$ cd specification
$ latexmk specification.tex -pdflatex -bibtex -latexoption=-shell-escape
```

