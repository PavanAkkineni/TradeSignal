"""
Python Backend Service Runner
This script starts the FastAPI backend service that handles all data analysis
"""
import subprocess
import sys
import os
import time
import signal

def start_python_backend():
    """Start the Python FastAPI backend server"""
    try:
        # Change to the TradeSignal directory
        backend_dir = r"c:\Users\admin\Documents\JOB APP\FastAPI\TradeSignal"
        os.chdir(backend_dir)
        
        print("Starting Python backend service on port 8000...")
        print(f"Working directory: {os.getcwd()}")
        
        # Start the FastAPI application
        process = subprocess.Popen(
            [sys.executable, "-m", "uvicorn", "app.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Print startup messages
        print("Python backend is starting...")
        time.sleep(3)  # Give it time to start
        
        print("\n" + "="*50)
        print("Python backend is running on http://localhost:8000")
        print("Press Ctrl+C to stop the service")
        print("="*50 + "\n")
        
        # Keep the process running
        try:
            while True:
                output = process.stdout.readline()
                if output:
                    print(f"[BACKEND] {output.strip()}")
                    
                # Check if process is still running
                if process.poll() is not None:
                    break
                    
        except KeyboardInterrupt:
            print("\n\nShutting down Python backend...")
            process.terminate()
            process.wait(timeout=5)
            print("Python backend stopped.")
            
    except Exception as e:
        print(f"Error starting Python backend: {e}")
        sys.exit(1)

if __name__ == "__main__":
    start_python_backend()
