from typing import Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from predictor import get_player_names, predict_match, PARAM_SPACE

app = FastAPI(title='Match Prediction Service')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://futscout.win/']  # tirar o *
    allow_methods=['GET', 'POST'],
    allow_headers=['*'],
)


class PredictRequest(BaseModel):
    home_players: list[str]
    away_players: list[str]
    model_type: str | None = None
    params: dict[str, Any] | None = None

    @field_validator('home_players', 'away_players')
    @classmethod
    def must_have_11(cls, v: list[str]) -> list[str]:
        if len(v) != 11:
            raise ValueError('Deve ter exatamente 11 jogadores')
        return v


@app.get('/players', response_model=list[str])
def players():
    return get_player_names()


@app.get('/models')
def models():
    return PARAM_SPACE


@app.post('/predict')
def predict(body: PredictRequest):
    model_type = body.model_type
    params     = body.params

    if model_type is not None:
        if model_type not in PARAM_SPACE:
            raise HTTPException(status_code=400, detail=f'Unknown model: {model_type}')
        allowed = PARAM_SPACE[model_type]
        for k, v in (params or {}).items():
            if k not in allowed or v not in allowed[k]:
                raise HTTPException(status_code=400, detail=f'Invalid param {k}={v} for {model_type}')

    try:
        return predict_match(body.home_players, body.away_players, model_type, params)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
