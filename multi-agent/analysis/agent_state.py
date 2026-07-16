from typing import TypedDict, Optional                
from shared.shared_models import FileAnalysis, FileContext, ReportOutput, FixResponse

class AgentState(TypedDict):
    repo_url: str
    repo_path: Optional[str]
    file_list: list[str]
    analyzed_files: list[FileAnalysis]
    flagged_files: list[FileContext]
    report: Optional[ReportOutput]
    next_action: Optional[str]      # what the router LLM decided to do next
    trace: list[str]                # human-readable log of agent decisions, for the UI
    done: bool