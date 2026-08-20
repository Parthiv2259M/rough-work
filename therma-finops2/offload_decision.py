import os
from dotenv import load_dotenv
from cloud_executor import execute_on_cloud

load_dotenv()
CLOUD_COST = float(os.getenv("CLOUD_COST_PER_HOUR", 0.05))

def evaluate_and_offload(remaining_tasks, current_temp, tracker, uri_data=None):
    """
    Cloud offload EXECUTION pipeline.
    
    NOTE: The offload *decision* is now made upstream by the URI engine
    (in local_monitor.py).  By the time this function is called, the
    system has already determined that offloading is the correct action.
    This function is purely responsible for:
      1. Logging WHY the offload was triggered (URI metadata).
      2. Executing each remaining task on the cloud via cloud_executor.
      3. Recording results in the tracker.
    
    Parameters
    ----------
    remaining_tasks : list[str]
        Task IDs that still need to be executed.
    current_temp : float
        CPU temperature (°C) at the time of the offload decision.
    tracker : PerformanceTracker
        Shared metrics tracker.
    uri_data : dict or None
        If the offload was triggered by the URI engine, this dict contains:
          T_j, D_hw_hat, R_cloud_hat, Q_edge_hat, alpha, beta, gamma, uri, decision.
        None when running in legacy threshold mode.
    """
    print(f"Evaluating offload for {len(remaining_tasks)} tasks...")
    
    # --- Log the decision rationale ---
    if uri_data is not None:
        print(f"  [URI Decision Rationale]")
        print(f"    URI Score     : {uri_data['uri']:.4f}")
        print(f"    D_hw (hw risk): {uri_data['D_hw_hat']:.4f}")
        print(f"    R_cloud       : {uri_data['R_cloud_hat']:.4f}")
        print(f"    Q_edge        : {uri_data['Q_edge_hat']:.4f}")
        print(f"    Weights (a,b,g): ({uri_data['alpha']:.3f}, {uri_data['beta']:.3f}, {uri_data['gamma']:.3f})")
        print(f"    Temperature   : {uri_data['T_j']} C")
    else:
        print(f"  [Legacy threshold mode] Temperature: {current_temp} C")
    
    # --- Execute remaining tasks on cloud ---
    print(f"Decision: Offloading to AWS EC2. Estimated cost factor: ${CLOUD_COST}/hr")
    
    for task in remaining_tasks:
        try:
            # Trigger cloud execution
            exec_time = execute_on_cloud(task)
            tracker.record_execution('cloud', task, exec_time)
        except Exception as e:
            print(f"Offload failed for task {task}: {e}")
            tracker.record_error('cloud', task)