# Changelog

## 1.2.0 - 2026-04-29

### Upgrade Notes

- Rebuilt the extension download package as `extension.zip`.
- Added a versioned package, `extension-v1.2.0.zip`, for release uploads and manual installs.
- After updating an unpacked Chrome extension, open `chrome://extensions/` and click the reload button on Design.md Extractor.

### Changed

- Expanded webpage evidence extraction with typography scale samples, navigation samples, image/media treatment, and motion styles.
- Updated the Gemini generation prompt to follow the extended DESIGN.md structure used by curated design-system libraries.
- Generated DESIGN.md files now target richer sections: visual theme, color roles, typography rules, component stylings, layout principles, depth, responsive behavior, agent prompt guide, and prompt contract.
- Kept YAML tokens, semantic roles, constraints, responsive rules, and component definitions as the normative contract for downstream AI UI generation.

