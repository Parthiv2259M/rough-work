import os
import time
import paramiko
from dotenv import load_dotenv

load_dotenv()
EC2_IP = os.getenv("AWS_EC2_IP")
EC2_USER = os.getenv("AWS_EC2_USER")
SSH_KEY = os.getenv("AWS_SSH_KEY_PATH")
DOCKER_IMAGE = os.getenv("DOCKER_IMAGE_NAME")

def execute_on_cloud(task_id):
    """
    Connects to EC2, runs the task inside a Docker container, and returns execution time.
    """
    print(f"Spinning up Docker container on EC2 for Task {task_id}...")
    start_time = time.time()
    
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        # Establish SSH connection
        ssh.connect(hostname=EC2_IP, username=EC2_USER, key_filename=SSH_KEY)
        
        # Docker command to run the task and automatically remove the container after (--rm)
        # We pass the task_id as an environment variable to the container
        docker_cmd = f"docker run --rm -v /home/ec2-user/therma-worker/logs:/app/logs -e TASK_ID={task_id} {DOCKER_IMAGE} python run_worker.py"
        
        stdin, stdout, stderr = ssh.exec_command(docker_cmd)
        
        # Wait for the command to finish and read output
        exit_status = stdout.channel.recv_exit_status() 
        
        if exit_status == 0:
            print(f"Cloud Task {task_id} completed successfully.")
        else:
            error_msg = stderr.read().decode().strip()
            raise RuntimeError(f"Docker execution failed: {error_msg}")
            
    finally:
        ssh.close()
        
    return time.time() - start_time