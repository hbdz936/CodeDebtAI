from langgraph.graph import StateGraph, END          # unchanged
from analysis.agent_state import AgentState
from analysis.agent_nodes import clone_node, analyze_node, contextualize_node, report_node
from analysis.agent_router import router_node

graph = StateGraph(AgentState)
graph.add_node("clone", clone_node)
graph.add_node("analyze", analyze_node)
graph.add_node("router", router_node)
graph.add_node("contextualize", contextualize_node)
graph.add_node("report", report_node)

graph.set_entry_point("clone")
graph.add_edge("clone", "analyze")
graph.add_edge("analyze", "router")
graph.add_conditional_edges(
    "router",
    lambda s: s["next_action"],
    {
        "contextualize": "contextualize",
        "skip_to_report": "report"
    }
)
graph.add_edge("contextualize", "report")
graph.add_edge("report", END)

app_graph = graph.compile()


def run_agentic_pipeline(repo_url: str):
    """Drop-in replacement for orchestrator.run_pipeline(), agentic version."""
    result = app_graph.invoke({
        "repo_url": repo_url,
        "trace": [],
        "done": False,
        "repo_path": None,
        "file_list": [],
        "analyzed_files": [],
        "flagged_files": [],
        "report": None,
        "next_action": None
    })
    return result["report"], result["repo_path"], result["trace"]