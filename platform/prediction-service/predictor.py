import os
import re
import joblib
import pandas as pd

_MODEL_PATH = os.getenv('MODEL_PATH', os.path.join(os.path.dirname(__file__), '../../ml-data/best_model.pkl'))
_DATA_PATH  = os.getenv('DATA_PATH',  os.path.join(os.path.dirname(__file__), '../../ml-data/player_stats.csv'))


def _parse_ratio(val):
    if pd.isna(val) or val == '-':
        return float('nan')
    m = re.search(r'\((\d+)%\)', str(val))
    return float(m.group(1)) if m else float('nan')


def _load():
    bundle = joblib.load(_MODEL_PATH)

    df = pd.read_csv(_DATA_PATH)
    df.replace('-', float('nan'), inplace=True)

    df['passes_certos_pct'] = df['passes_certos'].apply(_parse_ratio)
    df['dribles_pct']       = df['dribles'].apply(_parse_ratio)
    df['duelos_pct']        = df['duelos'].apply(_parse_ratio)
    df['xG']                = pd.to_numeric(df['xG'], errors='coerce')
    df['total_remates']     = pd.to_numeric(df['total_remates'], errors='coerce')
    df['rating']            = pd.to_numeric(df['rating'], errors='coerce')
    df['toques']            = pd.to_numeric(df['toques'], errors='coerce')
    df['toques_area_adv']   = pd.to_numeric(df['toques_area_adv'], errors='coerce')
    df['position_enc']      = df['position'].astype('category').cat.codes

    feat_cols = bundle['feature_cols']
    profiles  = df.groupby('player')[feat_cols].mean().reset_index()

    return bundle, profiles


_bundle, _player_profiles = _load()


def get_player_names() -> list[str]:
    return sorted(_player_profiles['player'].tolist())


def predict_match(home_players: list[str], away_players: list[str]) -> dict:
    model     = _bundle['model']
    feat_cols = _bundle['feature_cols']
    classes   = _bundle['classes']

    rows = []
    for name in home_players + away_players:
        profile = _player_profiles[_player_profiles['player'] == name]
        if profile.empty:
            rows.append({f: 0.0 for f in feat_cols})
        else:
            rows.append(profile[feat_cols].fillna(0).iloc[0].to_dict())

    probas   = model.predict_proba(pd.DataFrame(rows)[feat_cols])
    avg_prob = probas.mean(axis=0)
    return {cls: round(float(p) * 100, 1) for cls, p in zip(classes, avg_prob)}
