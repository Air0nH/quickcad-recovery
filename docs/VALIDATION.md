# Validation record — 2026-10-30

## Changes under test

The production candidate permits absent symbol definitions, recognizes zero-count entity lists as empty, improves truncated-string checks, accepts `.skf` in the chooser, and removes private source names from the UI/comments. It retains the `412 / 7.0` gate and existing geometry algorithms. The empty-state UI keeps report download available and disables SVG export.

## Executed checks

| Check | Result | What it establishes |
| --- | --- | --- |
| Six synthetic Node tests | passed | empty/unsupported distinction, malformed length/string handling, missing section and unsupported-release rejection |
| Original private input | geometry and SVG identical to preserved baseline | no observed regression for that drawing under a neutral source label |
| 15 independent files | one decoded, one empty, 13 header rejections | exact fixture outcomes, not general version coverage |
| Public sample byte map | checked against original bytes | documented count, record boundaries and vertex coordinates |
| Read-only inspector | executed on AS7-s02 | reproduces the structural JSON in evidence |
| Sample runner | executed on all 15 files | reproduces compatibility-results.json structurally |
| Embedded thumbnail | inspected during research | gross text/rectangle content corroboration only |

The private baseline has 13,780 top-level records and 44 symbol definitions. Expanded traversal visits 22,389 records. It renders 21,373 elements across 95 layers, omits 46 visits and marks 3,097 elements approximate. Aggregate type and issue counts are in `evidence/private-regression.json`. No geometry, names or text from that input are distributed.

The SVG identity comparison used `private-regression` as the same source label for both exporters. That matters because the name is embedded in SVG metadata. The compared SVG SHA-256 is `82f3ce4c1d3045e59dea1c434cc0aef953cf35498fd6a3269e0a9f46da010c51`.

## Reproduce

Run from the repository root:

```sh
node --test tests/recovery.test.cjs
python3 tools/fetch-samples.py
node tools/check-samples.cjs local-samples
node tools/inspect.cjs local-samples/AS7-s02.SKF
```

Compare JSON data with `evidence/compatibility-results.json` and `evidence/as7-s02-structure.json`; trailing whitespace is immaterial. The download script is optional and needs network access. Public fixture byte counts, Git blob IDs and SHA-256 hashes are pinned in the manifest. The private regression cannot be independently reproduced without its original input; its published counts are reported test evidence, not a distributable test suite.

The synthetic tests construct bytes matching implementation assumptions. They are useful contract and corruption checks, but must not be cited as independent proof of the native format. The inspector and decoder also share framing assumptions. Independent native-reference comparisons remain necessary.

The Python sample downloader passed syntax compilation. Its direct-network run did not complete in this environment; end-to-end network behavior is unverified. The actual fixtures used here were obtained through connected GitHub access and separately checked against all manifest hashes. This difference is recorded rather than treating connector downloads as a successful run of the Python script.

## Browser and native-application limits

Playwright was present, but its required Chromium executable was absent. The ordinary installer attempted downloads and failed on invalid/truncated ZIP responses. No automated browser UI test is claimed. After receiving the review package and a manual browser checklist, the project owner reported that it works on 2026-10-30. This is a user-reported smoke test; browser version and individual checklist results were not recorded. It does not establish empty-state behavior, error recovery, network isolation or complete fidelity. No native AutoSketch/QuickCAD reference export was available. Physical-scale accuracy and complete visual fidelity remain unverified.

Further manual browser coverage should include:

1. Open `index.html` locally and select the two independent AS7 files.
2. Confirm text/rectangle rendering, diagnostics, layer toggles, pan/zoom and downloaded SVG/report.
3. Confirm the empty file permits report download but disables SVG export.
4. Select an unsupported file, then a supported file again; check error recovery and controls.
5. Confirm no network requests occur while parsing/exporting.
6. Recheck the original private drawing locally without publishing it.

## Remaining engineering work

Introduce record-local bounds checks, strengthen section discovery, investigate remaining unknown fields, validate curve/text transforms, add independent primitive/symbol fixtures and establish units. A main-thread parser can still stall on complex inputs; current size/count guards are not a comprehensive denial-of-service defense. These are documented limits rather than promises of full support.
