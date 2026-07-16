from agent_graph import run_agentic_pipeline

if __name__ == "__main__":
    report, repo_path, trace = run_agentic_pipeline(
        "https://github.com/cosmicvibecoder/testing-code-debt"
    )

    print("=== REPORT ===")
    print(report)
    print("\n=== TRACE ===")
    for step in trace:
        print("-", step)