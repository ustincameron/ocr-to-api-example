# services/ollama_service.py
import socket
import subprocess
import time
import re
import json


def ensure_ollama_running():
    try:
        with socket.create_connection(("127.0.0.1", 11434), timeout=1):
            return True  # Already running
    except OSError:
        subprocess.Popen(
            ["ollama", "serve"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            start_new_session=True,
        )
        for _ in range(10):
            try:
                time.sleep(0.5)
                with socket.create_connection(("127.0.0.1", 11434), timeout=1):
                    return False  # We started it
            except OSError:
                continue
        raise RuntimeError("Timed out waiting for Ollama to start")


def shutdown_ollama():
    try:
        subprocess.run(["pkill", "-f", "ollama"], check=False)
        print("[ollama_service] Ollama shutdown requested")
    except Exception as e:
        print(f"[ollama_service] Error while shutting down Ollama: {e}")


def parse_text_with_ollama(text: str) -> dict | None:
    started_ollama = not ensure_ollama_running()

    prompt = f"""
You are an extraction-only engine.

Return a single-line JSON with the following fields:
- first_name
- last_name
- date_of_birth (in YYYY-MM-DD format)

Example:
{{"first_name":"John","last_name":"Doe","date_of_birth":"1904-05-12"}}

Only return the JSON. Do not explain. Do not greet. Do not say anything else.

Text:
---
{text}
---
"""

    result = subprocess.run(
        ["ollama", "run", "phi"],
        input=prompt,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )

    if result.stderr:
        print("[ollama_service] LLM stderr:\n" + result.stderr.strip())

    output = result.stdout.strip()
    print("[ollama_service] LLM raw output:\n" + output)

    json_match = re.search(r"\{.*\}", output, re.DOTALL)

    if started_ollama:
        shutdown_ollama()

    if json_match:
        return json.loads(json_match.group(0))

    return None
