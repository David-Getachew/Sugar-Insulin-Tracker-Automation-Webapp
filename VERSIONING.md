# Versioning Guidelines

This document outlines the versioning strategy for the Sugar Insulin Tracker project.

## Semantic Versioning

All future changes must follow semantic versioning tags:

- **v2.0.1, v2.0.2, etc.** for patches and fixes
- **v2.1.0, v2.2.0, etc.** for minor feature additions
- **v3.0.0, v4.0.0, etc.** for breaking changes

## Version Tagging Process

1. Ensure all changes are committed to the main branch
2. Create an annotated tag with a descriptive message:
   ```
   git tag -a v2.0.1 -m "Brief description of changes"
   ```
3. Push the tag to the remote repository:
   ```
   git push origin v2.0.1
   ```

## Security Considerations

- Never commit sensitive files like `.env` to the repository
- The `.gitignore` file is configured to exclude all `.env` variants:
  - `.env`
  - `.env.local`
  - `.env.production`
  - `.env.development`
- Always use `.env.example` with placeholder keys to document required variables

## Release Checklist

Before creating a new version tag, verify:

- [ ] All sensitive files are excluded via `.gitignore`
- [ ] `.env.example` file exists with placeholder keys
- [ ] All changes are committed to the main branch
- [ ] CHANGELOG.md is updated with release notes
- [ ] README.md is updated if necessary