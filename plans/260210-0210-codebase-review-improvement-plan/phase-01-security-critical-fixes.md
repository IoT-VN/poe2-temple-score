# Phase 01: Security & Critical Fixes

**Date**: 2026-02-10
**Status**: Pending
**Priority**: CRITICAL
**Estimated Effort**: 2-3 hours

## Overview

Fix critical security vulnerabilities and high-priority code quality issues that could lead to:
- XSS attacks
- Code maintainability problems
- Runtime errors from unused code

## Context Links

- Parent plan: `plan.md`
- Security analysis: `plans/reports/codebase-security-report.md`
- Code quality review: `plans/reports/code-quality-report.md`

## Key Insights

1. **XSS Vulnerability**: `temple-rating.html:972` uses `innerHTML` for user-controlled content
2. **Unused Code**: 6+ unused variables/functions across TypeScript files
3. **No Input Validation**: URL parsing lacks proper validation
4. **Global Scope Pollution**: All functions exposed in global namespace

## Requirements

### Functional Requirements
- Fix XSS vulnerability in suggestions rendering
- Remove all unused variables and functions
- Add URL input validation
- Wrap JavaScript in IIFE/module pattern

### Non-Functional Requirements
- No breaking changes to public APIs
- Maintain existing functionality
- Pass all existing tests
- Code must compile without errors

## Architecture

### Current State
```
temple-rating.html
├── Global functions (491-996 lines)
├── XSS vulnerability (line 972)
└── No input validation

poe2-temple-analyzer/src/index.ts
├── 24,790 lines (monolithic)
├── 6+ unused variables
└── Mixed eslint-disable comments
```

### Target State
```
temple-rating.html
├── IIFE-wrapped code
├── textContent for rendering
└── URL validation

poe2-temple-analyzer/src/index.ts
├── Clean, lint-free code
├── All variables used
└── Consistent error handling
```

## Related Code Files

### Files to Modify
1. `temple-rating.html` - Fix XSS, wrap in IIFE, add validation
2. `poe2-temple-analyzer/src/index.ts` - Remove unused code, fix linting

### Files to Reference
1. `test-rating.js` - Verify no regression in test utilities
2. `poe2-temple-analyzer/src/__tests__/index.test.ts` - Ensure tests still pass

## Implementation Steps

### Step 1: Fix XSS Vulnerability (CRITICAL)
**File**: `temple-rating.html:972`

**Current Code**:
```javascript
innerHTML = suggestions.map(s => `<li>${s}</li>`).join('');
```

**Fix**:
```javascript
textContent = ''; // Clear existing
suggestions.forEach(s => {
  const li = document.createElement('li');
  li.textContent = s;
  appendChild(li);
});
```

**Validation**: Test with malicious input `<script>alert('xss')</script>`

### Step 2: Wrap JavaScript in IIFE
**File**: `temple-rating.html` (lines 491-996)

Wrap all JavaScript in IIFE to prevent global scope pollution:
```javascript
(function() {
  'use strict';

  // All existing code here

  // Expose necessary functions to global scope
  window.analyzeTemple = analyzeTemple;
  window.extractShareData = extractShareData;
})();
```

### Step 3: Add URL Validation
**File**: `temple-rating.html`

Add validation function:
```javascript
function validateShareURL(url) {
  try {
    const parsed = new URL(url);
    if (!parsed.protocol.startsWith('http')) {
      throw new Error('Invalid protocol');
    }
    if (!parsed.searchParams.has('t')) {
      throw new Error('Missing temple data parameter');
    }
    return true;
  } catch (error) {
    console.error('Invalid URL:', error);
    return false;
  }
}
```

Call before processing:
```javascript
if (!validateShareURL(shareUrl)) {
  alert('Invalid temple share URL');
  return;
}
```

### Step 4: Remove Unused Variables (TypeScript)
**File**: `poe2-temple-analyzer/src/index.ts`

Remove/comment out:
- Line 148: `baseChars` variable
- Line 279: `data` parameter in `parseTempleArray`
- Lines 303-338: Unused functions (`calculateDistance`, `isStraightLine`, `findPath`)
- Lines 476-484: Commented-out variables with eslint-disable

**Validation**: Run `npm run lint` to confirm no warnings

### Step 5: Fix Linting Issues
**File**: `poe2-temple-analyzer/src/index.ts`

Standardize eslint-disable comments:
```typescript
// Before (inconsistent):
// eslint-disable
// eslint-disable-next-line @typescript-eslint/no-unused-vars

// After (consistent):
// eslint-disable-next-line @typescript-eslint/no-unused-vars
```

### Step 6: Test All Fixes
```bash
# Run linter
cd poe2-temple-analyzer
npm run lint

# Run tests
npm test

# Test static website
# Open temple-rating.html in browser
# Test with various URLs including malicious input
```

## Todo List

- [ ] Fix XSS vulnerability at line 972
- [ ] Wrap JavaScript in IIFE (lines 491-996)
- [ ] Add URL validation function
- [ ] Remove unused variable at line 148
- [ ] Remove unused parameter at line 279
- [ ] Remove unused functions (lines 303-338)
- [ ] Clean up eslint-disable comments
- [ ] Run linter to verify fixes
- [ ] Run test suite to ensure no regressions
- [ ] Manual test with sample URLs
- [ ] Manual test with malicious input (XSS)

## Success Criteria

- [ ] All ESLint warnings resolved
- [ ] XSS attempt shows plain text, not executed code
- [ ] Invalid URLs show error message
- [ ] All existing tests pass
- [ ] No new console errors
- [ ] Manual testing confirms functionality preserved

## Risk Assessment

### High Risk
- **XSS Fix**: May break existing HTML rendering
  - **Mitigation**: Test thoroughly with various suggestion formats

### Medium Risk
- **IIFE Wrapping**: May break inline event handlers
  - **Mitigation**: Explicitly expose required functions to window object

### Low Risk
- **Removing unused code**: No user-facing impact
  - **Mitigation**: Git revert if needed

## Security Considerations

### XSS Prevention
- Use `textContent` instead of `innerHTML` for user content
- Sanitize any HTML that must be rendered
- Use Content Security Policy headers (future enhancement)

### Input Validation
- Validate URL protocol
- Check for required parameters
- Reject malformed input early

### Error Handling
- Display user-friendly error messages
- Log security events (future: server-side logging)
- Never expose internal errors to users

## Next Steps

### Immediate (This Phase)
1. Implement XSS fix (Step 1)
2. Add input validation (Step 3)
3. Test security fixes

### Following Phases
- **Phase 02**: Modularize the massive `index.ts` file
- **Phase 03**: Add security-focused tests
- **Phase 04**: Document security best practices

### Dependencies
- Phase 02 (Modularization) depends on Phase 01 completion
- Phase 03 (Testing) depends on clean codebase from Phase 01

## Rollback Plan

If critical issues arise:
1. Revert specific commit: `git revert <commit-hash>`
2. Or rollback entire phase: `git reset --hard <pre-phase-commit>`
3. Re-run tests to verify system stability

## Notes

- **Do not ignore failing tests** to pass build
- **Test XSS fix with real malicious input**
- **Keep commits focused** - one fix per commit when possible
- **Document any breaking changes** in CHANGELOG (future: Phase 04)
