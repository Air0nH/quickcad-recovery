# Sources, credit and provenance

## Project provenance

Aaron initiated this project to recover a stranded legacy drawing. The code and documentation were developed with ChatGPT assistance. The original file remains private. The public candidate contains no original floor-plan geometry, layer names, text, thumbnail or drawing binary. The regression summary contains aggregate diagnostics only.

Original HTML baseline SHA-256: `02741967d94f60dc3a246f3cb516566689d5012ce88f8c4118ff8c7d93c26a69`. This identifies the preserved baseline used for comparison; that baseline itself is not included because its UI and comments name the private development drawing.

## External sources checked on 2026-10-30

- [Autodesk: QuickCAD/AutoSketch conversion](https://www.autodesk.com/support/technical/article/caas/sfdcarticles/sfdcarticles/How-to-open-QuickCAD-cad-files-in-AutoCAD.html). The English page yielded no readable body in the research tool. The indexed [official Spanish version](https://www.autodesk.com/es/support/technical/article/caas/sfdcarticles/sfdcarticles/ESP/How-to-open-QuickCAD-cad-files-in-AutoCAD.html) directs export through legacy applications. Its claim is scoped to Autodesk products.
- [Autodesk: AutoSketch to DWG](https://www.autodesk.com/support/technical/article/caas/sfdcarticles/sfdcarticles/How-to-convert-AutoSketch-files-into-AutoCAD-format.html): native Save As workflow.
- [Tyler Thorsted: AutoSketch investigation](https://preservation.tylerthorsted.com/2026/07/10/autosketch/): original header/version observations and independent sample provenance. Credit belongs to Thorsted for that research; it is not claimed as this project's discovery.
- [Thorsted's samples and proposed signatures](https://github.com/thorsted/PRONOM_Research/tree/main/Submissions/AutoSketch). Sample subtree: `8d4aca042eced20c4c5770ac6ac891eae73d6226`. Exact per-file blob SHA, SHA-256 and sizes are in `evidence/sample-manifest.json`. Proposed identification signatures are not full entity specifications or a claim of official PRONOM acceptance.
- [XnView supported formats](https://www.xnview.com/en/image-formats/) and [Filestar CAD page](https://filestar.com/skills/cad/): advertised QuickCAD/SKF capabilities refer to thumbnails.
- [ODA File Converter](https://www.opendesign.com/guestfiles/oda_file_converter): documented DWG/DXF conversion scope.
- [GNU LibreDWG](https://www.gnu.org/software/libredwg/): DWG-oriented library and conversion tools; not evidence of direct QuickCAD parsing.

The investigation did not locate a complete authoritative specification or verified general-purpose open-source decoder. This is a bounded search outcome, not a claim that none exists.

Public availability of third-party fixtures is not treated as a redistribution license. This package ships hashes, analysis and an optional retrieval script rather than those binaries. Aaron selected GNU GPL version 3 only (`GPL-3.0-only`) on 2026-10-30. The grant covers only rights contributors can license; it does not claim exclusive rights over format facts, third-party material or unprotectable AI-generated expression. The substantial use of ChatGPT is disclosed above. No determination of copyrightability or legal clearance is asserted.
