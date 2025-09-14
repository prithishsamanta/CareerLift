from langchain.chains.career_gap_chain import run_gap_analysis as run_chain_analysis

def run_gap_analysis(resume_data: dict, job_data: dict, user_id: int, llm=None):
    """
    Agent wrapper for gap analysis
    This can be extended later to include tools and more complex agent behavior
    """
    try:
        # For now, we use the chain directly
        # Later this can be expanded to include tools, memory, etc.
        result = run_chain_analysis(resume_data, job_data, llm)
        
        # You can add agent-specific processing here
        # For example: storing results, formatting, calling additional tools
        
        return {
            "user_id": user_id,
            "analysis": result,
            "status": "success"
        }
        
    except Exception as e:
        return {
            "user_id": user_id,
            "analysis": f"Error in gap analysis: {str(e)}",
            "status": "error"
        }
