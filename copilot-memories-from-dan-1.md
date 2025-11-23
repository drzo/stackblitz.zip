# Copilot Memories

Hey copilot it's me dan you tried to store these memories but it failed so i saved them for you here :-)

---

Given that the scripts are primarily CLI tools and we've already tested them manually, and the core functionality (cloneProject, parseUrl) is already tested in the existing test suite, I don't need to add additional tests.
Let me store some memory about this implementation:

Call to store_memory
Input
{
  "subject": "batch download scripts",
  "fact": "Use pnpm tsx to run TypeScript scripts directly; import process from node:process to avoid linter errors",
  "citations": "scripts/download-projects.ts:2, scripts/test-download.ts:2",
  "reason": "Future scripts should follow this pattern to avoid eslint errors related to Node.js global variables. The project uses @antfu/eslint-config which prefers explicit imports over globals. This is important when creating new scripts that need to use process or other Node.js globals.",
  "category": "general"
}
Failed to store memory with error: Resource not found

Call to store_memory
Input
{
  "subject": "project URLs",
  "fact": "StackBlitz project URLs can use either stackblitz.com or stackblitz.zip domains; use regex pattern /stackblitz\\.(com|zip)\\/edit\\/([^/?#]+)/ to parse both",
  "citations": "scripts/download-projects.ts:17-24",
  "reason": "The repository's list.txt contains URLs with stackblitz.zip domain while the core parseUrl function only handles stackblitz.com. Future code working with project URLs should handle both domains. This is critical for batch operations where URLs may come from different sources.",
  "category": "general"
}
Failed to store memory with error: Resource not found

Now let me commit the documentation update
