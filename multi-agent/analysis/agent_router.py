from groq import Groq                                 
from shared.config import LLM_MODEL
from analysis.agent_state import AgentState
client = Groq()  # reads GROQ_API_KEY from environment variable


def router_node(state: AgentState) -> dict:
    """LLM decides the next step based on what's been found so far."""
    analyzed = state["analyzed_files"]
    high_complexity_count = sum(
        1 for f in analyzed if f.complexity_grade in ("C", "D", "E", "F")
    )

    prompt = f"""We've statically analyzed {len(analyzed)} Python files in a repository.
{high_complexity_count} of them have high complexity (grade C or worse).

Decide the next action. Reply with exactly one word, nothing else:
- "contextualize" — worth checking git history/context to prioritize which files matter most
- "skip_to_report" — nothing here looks bad enough, report a clean repo directly
"""

    response = client.chat.completions.create(
        model=LLM_MODEL,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=10
    )
    decision = response.choices[0].message.content.strip().lower()

    # basic safety net in case the model replies with something unexpected
    if decision not in ("contextualize", "skip_to_report"):
        decision = "contextualize"

    return {
        "next_action": decision,
        "trace": state["trace"] + [
            f"Router decided: {decision} ({high_complexity_count}/{len(analyzed)} files high-complexity)"
        ]
    }