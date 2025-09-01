# Version Management System

## Overview
The JMS AI Agents project uses a comprehensive version management system that automatically updates version numbers, build numbers, and release dates based on git commits and development milestones.

## Current Version
- **Version**: 1.8.16-stable+74
- **Release Date**: 2025-09-01
- **Build Number**: 74 (git commit count)

## Version Structure
```
MAJOR.MINOR.PATCH-stage+BUILD
```

- **MAJOR**: Breaking changes and major features
- **MINOR**: New features and enhancements
- **PATCH**: Bug fixes and minor improvements
- **stage**: Development stage (alpha, beta, rc, stable)
- **BUILD**: Git commit count for tracking

## Automatic Version Updates

### Quick Commands
```bash
# Update patch version (bug fixes)
npm run version:patch

# Update minor version (new features)
npm run version:minor

# Update major version (breaking changes)
npm run version:major

# Update only dates to current date
npm run version:dates
```

### Manual Script Usage
```bash
# Direct script execution
node scripts/update_version.js patch
node scripts/update_version.js minor
node scripts/update_version.js major
node scripts/update_version_dates.js
```

## What Gets Updated Automatically

### 1. Version Numbers
- Major, minor, and patch numbers based on update type
- Build number from git commit count
- Release date to current date

### 2. Version History
- New milestone entry added to `VERSION_HISTORY`
- Features list for the new version
- Automatic date stamping

### 3. Files Updated
- `services/version_management.js` - Main version file
- All milestone dates updated to current date
- Build number synchronized with git

## Version Types

### Patch Updates (1.8.15 → 1.8.16)
- Bug fixes
- Minor improvements
- Documentation updates
- Performance optimizations

### Minor Updates (1.8.0 → 1.9.0)
- New features
- Enhanced functionality
- New AI agents
- API improvements

### Major Updates (1.8.0 → 2.0.0)
- Breaking changes
- Major architectural changes
- Complete rewrites
- Platform migrations

## Development Workflow

### 1. Make Changes
```bash
# Make your code changes
git add .
git commit -m "Feature: Add new functionality"
```

### 2. Update Version
```bash
# Choose appropriate version type
npm run version:patch  # For bug fixes
npm run version:minor  # For new features
npm run version:major  # For breaking changes
```

### 3. Commit and Push
```bash
# Commit version changes
git add .
git commit -m "v1.8.16: Auto-generated version update"
git push origin main
```

## Version Information Access

### In Code
```javascript
const { getCurrentVersion, getVersionInfo } = require('./services/version_management');

// Get current version string
const version = getCurrentVersion(); // "1.8.16-stable+74"

// Get detailed version info
const info = getVersionInfo();
// {
//   version: "1.8.16-stable+74",
//   major: 1,
//   minor: 8,
//   patch: 16,
//   stage: "stable",
//   build: 74,
//   releaseDate: "2025-09-01"
// }
```

### Via WhatsApp
- Send `info` or `versie` to get version information
- Version info includes current version, features, and development stats

## Milestone Tracking

Each version includes a milestone entry with:
- Version number
- Release date
- List of features and improvements
- Development statistics

### Example Milestone
```javascript
{
  version: "1.8.16",
  date: "2025-09-01",
  features: [
    "Auto-generated version update",
    "Build number: 74",
    "Release date: 2025-09-01",
  ],
}
```

## Best Practices

### 1. Version Naming
- Use semantic versioning (MAJOR.MINOR.PATCH)
- Always include build number for tracking
- Use descriptive commit messages

### 2. Release Frequency
- Patch: As needed for bug fixes
- Minor: Every few weeks for features
- Major: Every few months for major changes

### 3. Documentation
- Update this file when changing version system
- Document breaking changes in major versions
- Keep feature lists up to date

## Troubleshooting

### Common Issues

#### Build Number Not Updating
```bash
# Check git commit count
git rev-list --count HEAD

# Manually update if needed
npm run version:dates
```

#### Version File Not Found
```bash
# Check file path
ls -la services/version_management.js

# Recreate if missing
node scripts/update_version.js patch
```

#### Date Format Issues
```bash
# Force date update
npm run version:dates

# Check current date format
node -e "console.log(new Date().toISOString().split('T')[0])"
```

## Integration with CI/CD

### Automated Version Updates
The version system can be integrated with CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Update Version
  run: |
    npm run version:patch
    git add .
    git commit -m "v$(node -e "console.log(require('./services/version_management').getCurrentVersion())"): Auto-update"
    git push
```

### Environment Variables
- `VERSION_TYPE`: Set to patch/minor/major for automated updates
- `SKIP_VERSION_UPDATE`: Set to true to skip version updates

## Support

For issues with version management:
1. Check this documentation
2. Review the scripts in `scripts/` directory
3. Test with `npm run version:dates`
4. Check git commit count and dates

---

**Last Updated**: 2025-09-01  
**Version**: 1.8.16-stable+74
