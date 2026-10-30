# Reverse engineering a stranded drawing format

## 1. The problem and the evidence

The practical problem was a legacy drawing that modern tools could not readily open. The useful result needed to preserve editable vectors, not just enlarge an embedded preview. The original recovery decoder was developed against one private drawing. That file is deliberately absent from this package.

Three evidence sources support this account:

1. The preserved original HTML decoder, whose logic can be inspected and tested.
2. Independent public research samples with verified byte counts and hashes.
3. Reproducible experiments performed on 2026-10-30, with machine-readable summaries in `evidence/`.

The original reverse-engineering session's complete experiment history is not available here. Descriptions of its algorithm are reconstructed from source inspection. The optional-section discovery below is a newly executed investigation, not an embellished retelling of earlier work.

Use these evidence labels when extending the notes:

| Label | Meaning |
| --- | --- |
| Observed | Specific bytes or behavior directly inspected in an identified file |
| Tested | A described program or experiment was actually executed |
| Inferred | A field interpretation consistent with evidence, but not independently established |
| Heuristic | A search or fallback that recovers some cases without a complete grammar |
| Unknown | Meaning or behavior not established |

An algorithm existing in code does not prove its underlying format interpretation is correct. A parser returning objects does not prove the objects match the original drawing.

## 2. First separate identity, structure and presentation

The extension `.CAD` is not enough to identify a format. The supported files start with a compact binary prefix followed by length-prefixed ASCII-compatible identifiers. At offset 6, the sample contains a three-byte identifier; the next string is a release label.

```text
Offset  Bytes                 Interpretation in this sample
0x0000  0a 00 00 00 00 0b      observed prefix; full field semantics unknown
0x0006  03 34 31 32            string length 3, then "412"
0x000a  03 37 2e 30            string length 3, then "7.0"
```

These are not DWG headers. Thorsted's research supplied independent files that share these values, making it possible to test more than the original drawing. His other samples also show why the internal identifier must be kept separate from the release string. The current decoder deliberately does not broaden its gate to the other combinations.

The next distinction is between the embedded bitmap and the drawing entities. `AS7-s02.SKF` contains a BMP preview measuring 256 × 188 pixels. That is useful as a rough visual reference. Recovering it alone is not vector conversion. The actual text and shape records occur much later in the file.

## 3. Find candidate sections, then check their structure

Printable strings are useful landmarks in binary data. In the public sample, the byte sequence for the length-prefixed `Entity List` label starts at decimal 29,455 (`0x730f`). A small inspector reproduces the offsets:

```sh
node tools/inspect.cjs local-samples/AS7-s02.SKF
```

The inspector reports the file hash, candidate section positions and top-level record boundaries. It is an analysis aid, not an independent full parser. It uses the same section-framing hypothesis, so agreement with the converter is not an independent proof of that hypothesis.

The worked file has SHA-256:

```text
28826c77c943bfd8b0d70644cad8e2687a33e47bf1e13e85a68bf8f60854fc0a
```

| Decimal offset | Hex offset | Bytes or value | Interpretation |
| ---: | --- | --- | --- |
| 29455 | `0x730f` | `0b` + `Entity List` | 11-character section label |
| 29467 | `0x731b` | `04 4d 61 69 6e` | list name `Main` |
| 29472 | `0x7320` | four zero bytes | field skipped by the decoder; semantics unknown |
| 29476 | `0x7324` | `02 00 00 00` | two top-level records, little-endian |
| 29480 | `0x7328` | `09 00 00 00` | first record type, 9 |
| 29484 | `0x732c` | `68 00 00 00` | first body length, 104 bytes |
| 29488 | `0x7330` | body begins | first common header |
| 29592 | `0x7398` | `06 00 00 00` | second record type, 6 |
| 29596 | `0x739c` | `66 00 00 00` | second body length, 102 bytes |
| 29600 | `0x73a0` | body begins | second common header |
| 29702 | `0x7406` | end of second record | subsequent bytes are outside the main entity list |

The boundary equation is `next = record_offset + 8 + body_length`. For record one, `29480 + 8 + 104 = 29592`. For record two, `29592 + 8 + 102 = 29702`. Reaching plausible next boundaries is stronger evidence than spotting isolated small integers, but it still needs checks across more files and object types.

The current code searches for the first matching section string. It does not yet parse a complete top-level directory. A matching string inside unrelated payload could be misleading. Structural boundary checks reduce that risk but do not replace a fully understood container grammar.

## 4. Decode one small record before generalizing

The first record's body starts with a zero flags word and a one-character layer string, `1`. The next four bytes are skipped. The decoder then reads four little-endian IEEE-754 doubles.

| Offset | Width | Observed value | Current interpretation |
| ---: | ---: | --- | --- |
| 29488 | 4 | 0 | common flags |
| 29492 | 2 | length 1, `1` | layer name |
| 29494 | 4 | 1 | skipped text field; semantics not established |
| 29498 | 8 | 2.5 | insertion X |
| 29506 | 8 | 8.25 | insertion Y |
| 29514 | 8 | 0 | rotation used as radians |
| 29522 | 8 | 0.6 | horizontal text factor |
| 29530 | 4 | 1 | text-run count |
| 29534 | 8 | length 7, `Testing` | text content |
| 29542 | 8 | 0.25 | text height |
| 29550 | 8 | 0 | slant field read but not rendered |
| 29558 | 6 | length 5, `Arial` | font name read but substituted |
| 29564 | 4 | 0 | run color field |
| 29568 | 4 | 0 | run style field |

The remaining 20 bytes of this text body are not fully interpreted by the decoder. They must not be described as padding merely because the current implementation ignores them. Alignment or other presentation information may be among the unresolved fields; that is a hypothesis requiring controlled native samples.

The byte sequence `00 00 00 00 00 00 04 40` at offset 29498 decodes to 2.5 as a little-endian float64. Choosing float64 because it produces a plausible coordinate is only the first step: nearby fields, record lengths and visible placement must also agree. Here, the recovered word appears above the rectangle, consistent with the embedded preview. Exact glyph metrics and alignment remain unverified.

## 5. Recover a polyline with a length constraint

The second record is handled as a closed polyline. After the common header, the decoder does not have a fully documented fixed field map. Instead, it scans a bounded region for a possible vertex count `n`, with an exact remaining-length equation:

```text
vertex_data = candidate_count_offset + 20
remaining   = record_end - vertex_data
accept when remaining == 16*n or remaining == 48*n
```

Each XY pair consumes 16 bytes. The extra 16 bytes after the count are skipped metadata. In the longer layout, additional bytes are left uninterpreted; the current implementation still reads a contiguous XY array and approximates the result as straight segments. That organization and the field meanings need stronger independent evidence.

For the rectangle sample, the successful count field is at 29618, the XY array begins at 29638, and `29702 - 29638 = 64 = 4 × 16`. The recovered points are:

| Vertex | X | Y |
| ---: | ---: | ---: |
| 0 | 1.25 | 7.25 |
| 1 | approximately 7.75 | 7.25 |
| 2 | approximately 7.75 | 4.25 |
| 3 | 1.25 | 4.25 |

The binary values near 7.75 are actually `7.7499999999999964`; SVG formatting rounds to seven decimal places. This illustrates another distinction: a numerically stable rendering can still discard exact source precision.

## 6. An assumption fails on independent evidence

The original decoder required both `Symbol Definitions` and `Entity List`. That matched its development drawing. Both independent `412 / 7.0` samples lacked the former label and were rejected before entity parsing.

The competing explanations included an unrelated file layout, a differently encoded symbol section, or an optional absent section. The small experiment was to retain the header gate and entity parser while skipping symbol parsing only when the symbol-section marker was absent.

Results:

- `AS7-s01.SKF` has a zero-count top-level entity list.
- `AS7-s02.SKF` has the two records mapped above; both render, with the text explicitly marked approximate.
- The embedded preview agrees with their gross content: text above a rectangular outline.

This supports treating the section as optional for these files. It does not prove every symbol-free file has the same layout, and it does not prove references to unavailable symbols are valid. An actual unresolved symbol reference is still omitted with a diagnostic.

The adopted change also distinguishes an empty list from a nonempty list containing only unsupported objects. Otherwise a valid empty drawing and a failed recovery would misleadingly receive the same error.

## 7. Regression checks protect the original use case

The changed decoder was then run against the original private input. It produced the same object geometry and an identical SVG string when both exporters used the same neutral source label. The unchanged counts were 13,780 top-level records, 22,389 record visits after expansion, 21,373 rendered elements and 46 omitted visits.

This establishes that the change did not alter that baseline output. It does not establish that the output was correct in every detail before or after the change. A regression test preserves known behavior; a native-reference comparison evaluates fidelity. Both are needed for mature support claims.

## 8. How to extend the investigation

Prefer controlled drawings created by a legally available native application: one line, one circle, one arc, one text run, then a single changed property in each saved copy. Record application version, file hash and the precise edit. Compare offsets and lengths, then test the interpretation against a third file not used to derive it.

For symbols, use a definition at identity transform, followed by translated, rotated, nonuniformly scaled and mirrored instances. For units, use an explicitly dimensioned known-length object and compare a native export. For text, vary alignment, font, width, slant, multiline content and attributes independently. For curves, distinguish fitted points, control points and bulge-like parameters rather than drawing a plausible line through every pair of doubles.

Keep failed hypotheses in the experiment record. Do not remove unknown fields from the map just because the renderer ignores them. Preserve the source bytes, label approximations, and never promote the absence of an error into a claim of lossless conversion.
