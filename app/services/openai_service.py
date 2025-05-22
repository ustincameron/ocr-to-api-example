# services/openai_service.py
import openai
import re
import json
from app.config.settings import settings

client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)

def parse_text_with_openai(text: str) -> dict | None:
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

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
    )

    output = response.choices[0].message.content.strip()
    print("[openai_service] LLM raw output:\n" + output)

    json_match = re.search(r"\{.*\}", output, re.DOTALL)
    if json_match:
        return json.loads(json_match.group(0))

    return None
