# QuickCAD Recovery

Recover editable SVG geometry from a narrow family of legacy Autodesk QuickCAD `.CAD` and AutoSketch `.SKF` drawings, entirely in your browser.

**Experimental recovery, not lossless CAD conversion.** Currently gated to internal identifier `412` and release string `7.0`. An accepted header does not guarantee every object can be recovered. Physical units are unverified.

## Use it

Download `index.html` and open it locally in a modern browser. Choose a drawing, inspect the conversion report, select layers, and download SVG. No installation, account, server, external libraries or uploads are required. The file input accepts `.cad` and `.skf`; this does not imply support for all versions.

Text, curves, fills and other objects may be approximated or omitted. Original styling is not preserved. Keep the original file and review the result before using it for measurements or production work. Empty drawings are identified without pretending there is an SVG to export.

## Read the reverse engineering

The documentation is a central deliverable:

- [Investigation and worked binary example](docs/REVERSE_ENGINEERING.md): methodology, annotated offsets, how the section assumption failed, and evidence boundaries.
- [Observed format and decoder behavior](docs/FORMAT_NOTES.md): framing, object layouts, transformations, flags, unsupported fields and heuristics.
- [Experiments and validation](docs/VALIDATION.md): exact tests, results, reproduction commands and what those checks cannot establish.
- [Sources and provenance](docs/SOURCES.md): external research, sample hashes, project origins and attribution.

This project was developed through Aaron's collaboration with ChatGPT. The documentation reconstructs the existing decoder's behavior and records the current experiments. It does not invent a contemporaneous diary of the original session or present inferred fields as an official specification.

## Compatibility checkpoint

| Input | Result |
| --- | --- |
| Original private development drawing, `412 / 7.0` | 21,373 rendered elements; 46 omitted record visits; 3,097 approximated elements |
| Independent `AS7-s02.SKF`, `412 / 7.0` | Text and closed rectangle; text approximated |
| Independent `AS7-s01.SKF`, `412 / 7.0` | Valid empty top-level entity list |
| 13 other independent SKD/SKF samples | Rejected by the existing header gate |

Counts are diagnostics, not a fidelity score. Expanded symbols affect record counts. No native-application reference export was available for a full comparison.

## Development

Node is only needed for developer tools, not the browser app. Tests were executed with Node 24.22.1.

```sh
node --test tests/recovery.test.cjs
python3 tools/fetch-samples.py
node tools/inspect.cjs local-samples/AS7-s02.SKF
node tools/check-samples.cjs local-samples
```

The optional fetch command contacts GitHub and downloads third-party fixtures into ignored `local-samples/`. It verifies their hashes. The browser app itself makes no network requests. Do not commit private drawings or redistribute downloaded samples without an appropriate basis.

## Contributions and release status

Useful contributions include minimal shareable examples, native reference exports, additional record layouts and regression tests. Describe the creating application/version and what visibly differs. Do not post confidential drawings in issues.

This project is offered under GNU GPL version 3 only (`GPL-3.0-only`); see [LICENSE](LICENSE). This applies to rights the project contributors can license and does not create copyright in otherwise unprotectable material. Third-party materials retain their own terms. See [provenance](docs/SOURCES.md).

This is an independent interoperability project, not affiliated with or endorsed by Autodesk. Autodesk product names identify compatible source formats. No Autodesk software, private source drawing or third-party sample binaries are bundled. The project owner reported a successful browser smoke test on 2026-10-30. Detailed browser coverage and native-reference fidelity checks remain incomplete; see the validation record.
