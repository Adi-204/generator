---
"@asyncapi/generator-hooks": patch
"@asyncapi/generator": patch
---

The `generate:after` hook now writes a single self-contained (bundled) AsyncAPI document to each generated client's output directory, inlining external `$ref`s via `@asyncapi/bundler`. Previously the raw source was copied verbatim, leaving external refs (e.g. `./commons/servers.yml#/...`) unresolvable at client runtime and breaking schema compilation on the send path. When no source file path is available (string/URL input) or bundling fails, the hook falls back to writing the original source unchanged.
