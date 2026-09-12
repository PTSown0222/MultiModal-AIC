import json
import re
import gc
import torch
import argparse
from transformers import AutoModelForCausalLM, AutoTokenizer

MODEL_ID = [
    "Qwen/Qwen2.5-7B-Instruct-AWQ",
    "Qwen/Qwen2.5-1.5B-Instruct",
    ]

model_name = MODEL_ID[0]
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype="auto",
    device_map="auto"
)

system_prompt = """You are an AI assistant for Video Retrieval. Analyze the input video search query and decompose it into a JSON object with simple string lists for keys:
- "entities": list of strings (objects/people)
- "colors": list of strings (prominent colors)
- "actions": list of strings (actions/verbs)
- "spatial": list of strings (spatial relationships)

Example format:
{"entities": ["dog", "cat"], "colors": ["white"], "actions": ["runs"], "spatial": ["on the grass"]}
Output ONLY valid JSON."""

def decompose_query(query_text):
    result = {"entities": [], "colors": [], "actions": [], "spatial": []}
    model_inputs = None
    generated_ids = None
    
    try:
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Query: {query_text}"}
        ]
        text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
        model_inputs = tokenizer([text], return_tensors="pt").to(model.device)
        
        with torch.no_grad():
            generated_ids = model.generate(
                **model_inputs, 
                max_new_tokens=256,         
                temperature=0.01,           
                repetition_penalty=1.2,
            )
        
        out_ids = generated_ids[0][len(model_inputs.input_ids[0]):]
        response = tokenizer.decode(out_ids, skip_special_tokens=True).strip()
        
        if "```" in response:
            response = re.sub(r"^```(?:json)?\s*", "", response)
            response = re.sub(r"\s*```$", "", response)
            response = response.strip()
            
        result = json.loads(response)
        
    except json.JSONDecodeError:
        print("decode error, actual response:", repr(response))
    except Exception as e:
        print("Errors:", e)
        
    finally:
        del model_inputs
        del generated_ids
        gc.collect()
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
            
    return result

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--tasks_root", required=True, help="a direction of tals")
    ap.add_argument("--output_query", required=True, help="save output of user's query")
    ap.parse_args()
    decompose_query()