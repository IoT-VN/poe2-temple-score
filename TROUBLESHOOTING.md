# Troubleshooting Guide

Common issues and solutions for PoE2 Temple Score.

---

## MCP Server Issues

### MCP Server Not Starting

**Problem**: `npm start` fails or server crashes immediately

**Solutions**:
1. Ensure Node.js 20+ is installed: `node --version`
2. Clean build: `rm -rf dist/ && npm run build`
3. Reinstall dependencies: `rm -rf node_modules && npm install`
4. Check port conflicts (stdio doesn't use ports)

**Log**: Check console.error output for specific error messages

### Claude Desktop Not Recognizing MCP Server

**Problem**: Server not available in Claude Desktop

**Solutions**:
1. Verify absolute path in config (no relative paths)
2. Check `dist/index.js` exists: `ls poe2-temple-analyzer/dist/`
3. Test server manually: `cd poe2-temple-analyzer && npm start`
4. Check Claude Desktop logs: `%APPDATA%\Claude\logs`
5. Restart Claude Desktop after config changes

**Config Example** (Windows):
```json
{
  "mcpServers": {
    "poe2-temple-analyzer": {
      "command": "node",
      "args": [
        "D:\\CURSOR\\sulozor.github.io-gh-pages\\poe2-temple-analyzer\\dist\\index.js"
      ]
    }
  }
}
```

### MCP Server Returns "Unknown Tool"

**Problem**: Tool not found when called from Claude

**Solutions**:
1. Verify server is running
2. Check tool name spelling (case-sensitive)
3. Review server logs for tool registration errors
4. Restart server after code changes

---

## Temple Analysis Issues

### "Invalid Temple Share URL" Error

**Problem**: URL validation fails

**Common Causes**:
- URL missing `?t=` parameter in hash
- Using `javascript:` or `data:` protocol
- Malformed URL format

**Solutions**:
1. Ensure URL format: `http://site/#/page?t=<encoded_data>`
2. Check URL hash contains `?t=` parameter
3. Use HTTP/HTTPS protocol only

**Valid Example**: `http://localhost:8080/#/temple?t=ABC123`

### "Failed to Decode Temple Data" Error

**Problem**: Cannot decode temple from share URL

**Common Causes**:
- Encoded data is corrupted
- Unsupported charset version
- Invalid encoding format

**Solutions**:
1. Verify share URL is complete
2. Check URL encoding (copy full URL)
3. Try a different share URL
4. Report charset version if persistent

**Debug**: Check console.error logs for decode details

### Unexpected Star Rating

**Problem**: Rating seems incorrect

**Common Causes**:
- Scoring criteria updated
- Room tier values changed
- Tech patterns not detected

**Solutions**:
1. Review `get_rating_criteria` tool output
2. Check room tier assignments
3. Verify tech pattern detection
4. Read suggestions for improvement details

**Rating Scale**:
- 5 Stars: 90-105 points
- 4 Stars: 60-89 points
- 3 Stars: 30-44 points
- 2 Stars: 15-29 points
- 1 Star: 0-14 points

---

## Static Website Issues

### GitHub Pages Not Deploying

**Problem**: Changes not visible on GitHub Pages

**Solutions**:
1. Check workflow status: `.github/workflows/deploy.yml`
2. Verify branch is `master`
3. Clear GitHub Pages cache (Settings → Pages)
4. Wait up to 10 minutes for deployment

### Temple Analysis Not Working in Browser

**Problem**: Nothing happens when clicking "Analyze"

**Solutions**:
1. Open browser DevTools (F12) - check Console tab for errors
2. Verify share URL is pasted correctly
3. Check browser compatibility (Chrome, Firefox, Edge recommended)
4. Clear browser cache
5. Disable browser extensions that might interfere

### XSS Warning/Error

**Problem**: Concerns about security

**Solution**: XSS vulnerability fixed (Phase 01)
- Uses `textContent` instead of `innerHTML`
- URL validation prevents injection attacks
- All user input sanitized

---

## Development Issues

### Tests Failing

**Problem**: `npm test` shows failures

**Solutions**:
1. Run with verbose output: `npm test -- --verbose`
2. Check specific test: `npm test -- --testNamePattern="test name"`
3. Update snapshots if needed: `npm test -- -u`
4. Ensure dependencies installed: `npm install`

### Build Errors

**Problem**: `npm run build` fails

**Solutions**:
1. Clean build: `rm -rf dist/`
2. Check TypeScript version: `tsc --version`
3. Verify no syntax errors: `npm run lint`
4. Check Node.js version compatibility

### ESLint Errors

**Problem**: `npm run lint` shows errors

**Common Issues**:
- Unused variables: Remove or prefix with `_`
- Missing imports: Add required imports
- Type errors: Fix type annotations

**Auto-fix**: `npm run lint:fix`

---

## Performance Issues

### Slow Analysis

**Problem**: Temple analysis takes long time

**Typical Performance**:
- URL parsing: ~5ms
- Data decoding: ~50ms
- Analysis: ~100ms (first), ~5ms (cached)

**Solutions**:
1. Clear browser cache
2. Close other browser tabs
3. Check for browser extensions slowing page
4. Verify temple size (large temples take longer)

### High Memory Usage

**Problem**: Browser tab using lots of memory

**Solutions**:
1. Refresh page after analysis
2. Close unused tabs
3. Clear browser cache
4. Check for memory leaks (rare)

---

## Getting Help

### Documentation

- [README.md](../README.md) - Project overview
- [CHANGELOG.md](../CHANGELOG.md) - Version history
- [AGENTS.md](../AGENTS.md) - Development guide
- [docs/api-reference.md](api-reference.md) - MCP API docs

### Reporting Issues

1. Search existing issues: https://github.com/IoT-VN/poe2-temple-score/issues
2. Create bug report with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser/Node version
   - Share URL (if applicable, sanitize first)
   - Console error logs

### Feature Requests

1. Check roadmap for planned features
2. Create feature request on GitHub Issues
3. Describe use case and benefit
4. Provide examples if possible

---

## FAQ

### Q: What temple formats are supported?

A: Currently supports PoE2 temple share URLs with `?t=` parameter. The decoder auto-detects multiple charset versions.

### Q: How do I integrate with my app?

A: Use the MCP server or import modules directly:
```typescript
import { analyzeTemple, decodeTempleData } from 'poe2-temple-analyzer';
```

### Q: Can I use this offline?

A: Yes, once dependencies installed. No internet required after `npm install`.

### Q: What's the maximum temple size?

A: Supports up to 25 rooms (standard temple layout). Larger temples may have performance issues.

### Q: How accurate are the ratings?

A: Ratings based on PoE2 community meta. May adjust over time as game mechanics change.

### Q: Can I customize scoring criteria?

A: Yes, edit `config/scoring-config.ts` and rebuild. See API reference for details.

### Q: Why does my temple get 1 star?

A: Check suggestions for specific reasons:
- Snake chain too short (< 4 rooms)
- Missing high-tier rooms (T6-T7)
- Low room count overall
- Poor room distribution

---

## Advanced Troubleshooting

### Enable Debug Logging

1. Open browser DevTools (F12)
2. Go to Console tab
3. All `console.log` messages will appear
4. Look for "Error decoding temple data" messages

### Check Temple Data Structure

```javascript
// In browser console after analysis
const lastAnalysis = window.lastTempleAnalysis;
console.log(lastAnalysis);
```

### Manually Test Decoder

```typescript
import { decodeTempleData } from 'poe2-temple-analyzer';

const encoded = 'your_encoded_string_here';
const result = decodeTempleData(encoded);
console.log(result);
```

### Verify MCP Connection

```bash
# Start server
cd poe2-temple-analyzer
npm start

# In another terminal, test
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | node -e "require('readline').createInterface({input:process.stdin}).on('line',(line)=>console.log(JSON.stringify(JSON.parse(line))))"
```

---

## System Requirements

### Minimum Requirements
- **Node.js**: 20.0.0 or higher
- **npm**: 10.0.0 or higher
- **Memory**: 512MB RAM
- **Disk**: 100MB free space

### Recommended Requirements
- **Node.js**: Latest LTS
- **Browser**: Chrome 120+, Firefox 120+, Edge 120+
- **Memory**: 2GB RAM
- **Disk**: 500MB free space

---

## Recovery Procedures

### Restore Working State

```bash
# Reset to last known good state
git status
git diff
git checkout -- .

# Revert commits
git log --oneline -5
git revert <commit-hash>

# Hard reset (use with caution)
git reset --hard <commit-hash>
```

### Clean Rebuild

```bash
# Remove all build artifacts
rm -rf dist/ node_modules/

# Fresh install
npm install
npm run build
npm test
```

---

**Still stuck?**

- Check documentation: `../docs/`
- Search issues: https://github.com/IoT-VN/poe2-temple-score/issues
- Create new issue with details and logs
