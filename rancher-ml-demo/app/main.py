from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Input(BaseModel):
    data: list

@app.post('/predict')
async def predict(inp: Input):
    # Dummy model: returns sum of input numbers
    total = sum(inp.data)
    return {'prediction': total}

@app.get('/')
async def root():
    return {'status': 'ok'}
