# Observed format and current decoding rules

This is a partial reverse-engineered map, not an Autodesk specification. Names assigned to fields express the current interpretation. Unnamed bytes remain unknown. Read the [worked example](REVERSE_ENGINEERING.md) for direct evidence.

## Scalars and strings

| Item | Current rule | Qualification |
| --- | --- | --- |
| Integer | unsigned 32-bit little-endian | used for types, lengths, flags and counts; not a universal rule for every field |
| Coordinate | IEEE-754 float64 little-endian | finite, absolute value at most `1e12` in the current reader |
| Short string | one-byte byte length, followed by encoded bytes | text decoded as Windows-1252; NUL characters removed |
| Long string | leading `ff`, then uint32 length, then bytes | inherited decoder convention; not established by the small public worked example |
| Record | uint32 type, uint32 body length, body | length excludes the eight-byte record prefix |

String-length bytes and payload must fit the supplied section boundary. The current numeric readers check file boundaries; not every field read is yet constrained to its containing record. Further hardening should introduce record-local cursors without changing verified geometry.

## Container sections

The reader looks for length-prefixed `Symbol Definitions` and `Entity List`. The former is optional; if present, it must precede the latter. The main list starts with a length-prefixed name, four skipped bytes, a uint32 entity count, and that many records. Additional sections may follow; their bytes are not interpreted as main entities.

Symbol definitions are read as a name, a body length, and a body containing skipped fields and a nested record count/list. The loop stops on a zero byte or a parsing problem. Partial symbol failures become diagnostics. The terminating convention and all skipped fields require fuller documentation. A definition is stored as child records; instances expand it during rendering.

## Common entity header

The body begins with uint32 flags and a layer-name string. A variable number of style-related fields follow according to flags. These are implementation interpretations:

| Mask | Current behavior | Status |
| --- | --- | --- |
| `0x0002` | read color-like value; sometimes name plus another value | inferred style convention |
| `0x0008` | consume another style-like value with similar encoding | exact meaning unresolved |
| `0x0040` | skip four bytes | meaning unresolved |
| `0x0080` | mark polygon/path output as fill/hatch approximation | inherited inference |
| `0x0100` | parse instance attribute entries | tested in the private baseline, no minimal independent fixture |
| `0x1000` | omit certain primitives as 3D-oriented | interpretation not independently verified |
| `0x2000` | skip 17 bytes for group records | exact contents unresolved |

Color integers below 128 are mapped through a small palette; larger non-sentinel values can cause name/value fields to be consumed. Several high sentinel values are treated specially. The parser reads some original colors, but the SVG exporter uses monochrome or generated layer colors. Do not confuse reading a field with preserving it in output.

## Entity dispatch

| Type | Current interpretation | Recovery rule | Important uncertainty/loss |
| ---: | --- | --- | --- |
| 1 | line | last five doubles; first four become endpoints | fifth double ignored; tail-based extraction is an inferred layout |
| 2 | circular arc | last five doubles: center X/Y, radius, start/end angles | angle convention and full-circle fallback need more fixtures |
| 3 | circle | last three doubles: center X/Y and radius | flags may exclude cases |
| 4 | open polyline-like path | bounded vertex-count search | curved/width data reduced to straight outline |
| 6 | closed polyline-like path | same search; close SVG path | some layouts still unrecognized |
| 7 | spline-like path | same search; join vertices | control/fitted-point interpretation unresolved |
| 8 | unknown unsupported | skip with warning | no inferred geometry claimed |
| 9 | text | insertion, rotation, factor and text runs | fonts, style, slant, alignment and metrics not faithfully retained |
| 14 | symbol instance | resolve trailing definition name, compose transform, recurse | trailing-name search and transform layout are heuristic |
| 18 | elliptical arc | skip with warning | no partial ellipse emitted |
| 19 | group | read nested count/list and recurse | flag-dependent metadata partly unknown |
| other | unsupported | skip with warning | error report identifies type |

The private regression exercised every listed type. Only types 6 and 9 have the small independently sourced example detailed in this package. Record counts do not establish correctness for all variants of a type.

## Geometry and transformations

Affine matrices are `[a,b,c,d,e,f]`, mapping `(x,y)` to `(a*x+c*y+e, b*x+d*y+f)`. Instance transforms combine translation, independent X/Y scaling and rotation. Child transforms compose with parents. A child on layer `0` inherits the parent layer. Attribute substitution can replace `<%db("key")>` text with instance values; missing keys appear as bracketed placeholders.

The instance parser scans near the record end for a short string matching a known definition. It reads six doubles immediately before that string, using five as X, Y, X scale, Y scale and angle; the double at offset +32 is unused. This is not proof that long names, alternative attributes or every transformed symbol are handled correctly.

SVG uses a different vertical-axis convention, so the drawing group flips Y. Text has an additional local flip to remain upright. Arc output uses SVG arc commands; bounds are sampled at 65 angular positions. Sampling is approximate, especially after transforms, and should not be described as an exact extrema calculation. Circle bounds transform a containing square, which can overestimate the rendered extent.

Text width is estimated from character count, height and width factor. The output substitutes Arial/sans-serif and uses the largest run height. Styles and individual run metrics are not preserved. Negative width factors are made positive. Text has one approximation count even when several aspects differ.

## Limits and diagnostics

Input is capped at 80 MiB. Lists are capped at 200,000 records, recursion at 20 levels, and expansion has a 300,000-visit guard. Vertices and text runs also have limits. These are defensive implementation choices, not file-format limits or proof that hostile inputs cannot consume excessive resources. Parsing runs on the browser's main thread.

`records` counts visits including nested objects. `rendered` counts emitted elements. `skipped` counts omitted visits. `approximated` counts elements marked approximate. Issue categories can overlap and therefore need not sum to a unique object total. Nonempty lists yielding no supported output fail recovery; zero-count lists return an explicit empty state.

Physical units, drawing scale, dimension semantics, native line widths/dashes, layer visibility, exact text placement, hatch patterns, unsupported objects and full round-trip preservation remain outside established support.
