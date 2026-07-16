from fix_graph import fix_graph_app

result = fix_graph_app.invoke({
    "repo_path": r"C:\Users\LOKESH RATHI\OneDrive\文档\CodeDebtAI\multi-agent\temp_repos\testing-code-debt",
    "file_path": "app.py",   # relative path, matching what read_file_content expects
    "issue_reason": "High complexity (D) — flagged by priority rule",
    "original_code": None,
    "suggested_code": None,
    "diff": None,
    "fix_valid": None,
    "retry_count": 0,
    "trace": []
})

print("=== SUGGESTED CODE ===")
print(result["suggested_code"])
print("\n=== TRACE ===")
for step in result["trace"]:
    print("-", step)