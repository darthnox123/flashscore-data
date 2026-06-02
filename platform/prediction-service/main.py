from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from predictor import get_player_names, predict_match

app = FastAPI(title='Match Prediction Service')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_methods=['GET', 'POST'],
    allow_headers=['*'],
)


class PredictRequest(BaseModel):
    home_players: list[str]
    away_players: list[str]

    @field_validator('home_players', 'away_players')
    @classmethod
    def must_have_11(cls, v: list[str]) -> list[str]:
        if len(v) != 11:
            raise ValueError('Deve ter exatamente 11 jogadores')
        return v


@app.get('/players', response_model=list[str])
def players():
    return get_player_names()


@app.post('/predict')
def predict(body: PredictRequest):
    try:
        return predict_match(body.home_players, body.away_players)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
