import json

class PerformanceTracker:
    def __init__(self):
        self.metrics = {
            'local': {'tasks_completed': 0, 'total_time_seconds': 0.0},
            'cloud': {'tasks_completed': 0, 'total_time_seconds': 0.0},
            'errors': []
        }
        # --- URI Analytics Storage ---
        self.uri_snapshots = []  # list of per-task URI data dicts

    def record_execution(self, environment, task_id, duration):
        """Logs a successful task execution."""
        if environment in self.metrics:
            self.metrics[environment]['tasks_completed'] += 1
            self.metrics[environment]['total_time_seconds'] += duration

    def record_error(self, environment, task_id):
        """Logs an execution failure."""
        self.metrics['errors'].append({'env': environment, 'task': task_id})

    def record_uri_snapshot(self, uri_data):
        """
        Stores a per-task URI snapshot for analytics reporting.

        Parameters
        ----------
        uri_data : dict
            Must contain keys: T_j, D_hw_hat, R_cloud_hat, Q_edge_hat,
            alpha, beta, gamma, uri, decision ('local' | 'cloud').
        """
        self.uri_snapshots.append(uri_data.copy())

    def display_report(self):
        """Outputs a clean, comparative view of the system's performance."""
        print("\n" + "="*50)
        print("THERMA-FINOPS: PERFORMANCE REPORT")
        print("="*50)
        
        total_tasks = self.metrics['local']['tasks_completed'] + self.metrics['cloud']['tasks_completed']
        if total_tasks == 0:
            print("No tasks completed.")
            return

        for env in ['local', 'cloud']:
            completed = self.metrics[env]['tasks_completed']
            time_spent = self.metrics[env]['total_time_seconds']
            contribution = (completed / total_tasks) * 100
            
            print(f"[{env.upper()} NODE]")
            print(f"  Tasks Handled : {completed} ({contribution:.1f}%)")
            print(f"  Total Compute : {time_spent:.2f} seconds")
            if completed > 0:
                print(f"  Avg Time/Task : {time_spent/completed:.2f} seconds")
            print("-" * 50)
            
        if self.metrics['errors']:
            print(f"WARNING: {len(self.metrics['errors'])} tasks failed during execution.")

        # --- URI ENGINE ANALYTICS (appended below existing report) ---
        self._display_uri_analytics()

    def _display_uri_analytics(self):
        """
        Prints a summary of URI trigger statistics.
        Only shown when URI snapshots were recorded (i.e., TRIGGER_MODE=uri).
        """
        if not self.uri_snapshots:
            print("\n[URI Analytics] No URI data recorded (threshold mode or no tasks ran).")
            return

        print("\n" + "="*50)
        print("URI ENGINE ANALYTICS")
        print("="*50)

        total_snapshots = len(self.uri_snapshots)
        offload_snapshots = [s for s in self.uri_snapshots if s['decision'] == 'cloud']
        local_snapshots = [s for s in self.uri_snapshots if s['decision'] == 'local']

        print(f"Total URI evaluations : {total_snapshots}")
        print(f"Local decisions       : {len(local_snapshots)}")
        print(f"Offload triggers      : {len(offload_snapshots)}")
        print("-" * 50)

        # --- Per-evaluation URI trace ---
        print("\n[Per-Task URI Trace]")
        print(f"  {'#':<4} {'Temp(C)':<10} {'D_hw':<8} {'R_cloud':<8} {'Q_edge':<8} "
              f"{'a':<6} {'b':<6} {'g':<6} {'URI':<8} {'Decision'}")
        print("  " + "-" * 80)
        for idx, s in enumerate(self.uri_snapshots, 1):
            print(f"  {idx:<4} {s['T_j']:<10.2f} {s['D_hw_hat']:<8.4f} {s['R_cloud_hat']:<8.4f} "
                  f"{s['Q_edge_hat']:<8.4f} {s['alpha']:<6.3f} {s['beta']:<6.3f} {s['gamma']:<6.3f} "
                  f"{s['uri']:<8.4f} {s['decision']}")

        # --- Averages ---
        print("\n[Averages Across All Evaluations]")
        avg_uri = sum(s['uri'] for s in self.uri_snapshots) / total_snapshots
        avg_D = sum(s['D_hw_hat'] for s in self.uri_snapshots) / total_snapshots
        avg_R = sum(s['R_cloud_hat'] for s in self.uri_snapshots) / total_snapshots
        avg_Q = sum(s['Q_edge_hat'] for s in self.uri_snapshots) / total_snapshots
        avg_alpha = sum(s['alpha'] for s in self.uri_snapshots) / total_snapshots
        avg_beta = sum(s['beta'] for s in self.uri_snapshots) / total_snapshots
        avg_gamma = sum(s['gamma'] for s in self.uri_snapshots) / total_snapshots

        print(f"  Avg URI       : {avg_uri:.4f}")
        print(f"  Avg D_hw      : {avg_D:.4f}")
        print(f"  Avg R_cloud   : {avg_R:.4f}")
        print(f"  Avg Q_edge    : {avg_Q:.4f}")
        print(f"  Avg Weights   : a={avg_alpha:.3f}, b={avg_beta:.3f}, g={avg_gamma:.3f}")

        # --- Trigger-point stats ---
        if offload_snapshots:
            print("\n[At Offload Trigger Point]")
            trigger = offload_snapshots[0]  # first (and typically only) offload trigger
            print(f"  Temperature   : {trigger['T_j']} C")
            print(f"  URI Score     : {trigger['uri']:.4f}")
            print(f"  D_hw_hat      : {trigger['D_hw_hat']:.4f}")
            print(f"  R_cloud_hat   : {trigger['R_cloud_hat']:.4f}")
            print(f"  Q_edge_hat    : {trigger['Q_edge_hat']:.4f}")
            print(f"  Weights (a,b,g): ({trigger['alpha']:.3f}, {trigger['beta']:.3f}, {trigger['gamma']:.3f})")
        print("=" * 50)