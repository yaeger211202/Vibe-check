## Description
<!-- Provide a brief description of the changes in this PR -->

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Code refactoring
- [ ] Documentation update
- [ ] Other (please describe):

## Related Issues
<!-- Link to any related issues using #issue_number -->
Closes #

## JavaScript/TypeScript Coding Standards Checklist

### Naming Conventions
- [ ] **Components/Classes**: Use nouns in `UpperCamelCase` (e.g., `UserProfile`, `MapContainer`)
- [ ] **Functions/Methods**: Use verbs in `lowerCamelCase` (e.g., `calculateDistance()`, `getUserData()`)
- [ ] **Variables**: Use descriptive names in `lowerCamelCase` (e.g., `userName`, `locationData`)
- [ ] **Constants**: Use `UPPER_CASE` with underscores (e.g., `MAX_ZOOM_LEVEL`, `API_BASE_URL`)
- [ ] **Files**: Use lowercase with hyphens or camelCase (e.g., `user-service.js`, `MapView.jsx`)

### Documentation (JSDoc)
- [ ] **JSDoc**: All exported functions have JSDoc comments
- [ ] **JSDoc**: All parameters documented with `@param` tags including types
- [ ] **JSDoc**: Return values documented with `@returns` tag including types
- [ ] **JSDoc**: React components have prop descriptions
- [ ] **Comments**: Complex logic explained with inline comments

### Code Formatting
- [ ] **Indentation**: Using 2 spaces (no tabs) for each indentation level
- [ ] **Line Length**: Lines limited to 120 characters (no horizontal scrolling)
- [ ] **Braces**: Opening brace `{` at the end of the statement line
- [ ] **Braces**: Closing brace `}` on a new line, aligned with opening statement
- [ ] **Braces**: All control statements (`if`, `for`, `while`) use braces
- [ ] **Semicolons**: Consistent use of semicolons (required by style guide)
- [ ] **Quotes**: Using single quotes for strings (except JSX attributes)

### Code Quality
- [ ] **No `var`**: Using `const` and `let` instead of `var`
- [ ] **No Console**: Removed debug `console.log()` statements (except error handling)
- [ ] **Descriptive Names**: Variables have meaningful names (min 2 characters, except loop counters)

### React-Specific (Frontend Only)
- [ ] **Components**: Components use PascalCase naming
- [ ] **Hooks**: React hooks rules followed (rules of hooks)
- [ ] **Props**: PropTypes or TypeScript types defined
- [ ] **Keys**: List items have unique keys (not array index)
- [ ] **Self-Closing**: Empty tags are self-closing

### Node.js-Specific (Backend Only)
- [ ] **Async/Await**: Using async/await for asynchronous operations
- [ ] **Error Handling**: Proper try/catch blocks and error middleware
- [ ] **Environment Variables**: Sensitive data in `.env` files
- [ ] **SQL Injection**: Using parameterized queries for PostgreSQL

## Testing
- [ ] Unit tests added/updated for new functionality
- [ ] All existing tests pass
- [ ] Manual testing completed (describe below)
- [ ] API endpoints tested with Postman/Thunder Client

### Manual Testing Details
<!-- Describe how you tested these changes -->

## Screenshots/Videos (if applicable)
<!-- Add screenshots for UI changes or terminal output -->

## Database Changes
- [ ] No database changes
- [ ] Database migrations included
- [ ] Seed data updated (if necessary)

## Additional Notes
<!-- Any additional information reviewers should know -->

---

## Reviewer Checklist
- [ ] Code follows the JavaScript/TypeScript coding standards above
- [ ] JSDoc documentation is complete and accurate
- [ ] Changes are well-tested
- [ ] No security vulnerabilities introduced (SQL injection, XSS, etc.)
- [ ] Performance implications considered
- [ ] API endpoints properly documented
