import os
import re
import joblib
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import GroupShuffleSplit
from sklearn.preprocessing import LabelEncoder
from xgboost import XGBClassifier

_MODEL_PATH = os.getenv('MODEL_PATH', os.path.join(os.path.dirname(__file__), '../../ml-data/best_model.pkl'))
_DATA_PATH  = os.getenv('DATA_PATH',  os.path.join(os.path.dirname(__file__), '../../ml-data/player_stats.csv'))

PARAM_SPACE = {
    'lr': {
        'C':      [0.01, 0.1, 1.0, 10.0],
        'solver': ['lbfgs', 'saga'],
    },
    'rf': {
        'n_estimators': [50, 100, 200],
        'max_depth':    [None, 5, 10],
    },
    'xgb': {
        'learning_rate': [0.01, 0.1, 0.3],
        'n_estimators':  [50, 100, 200],
    },
}

DEFAULT_PARAMS = {
    'lr':  {'C': 1.0, 'solver': 'lbfgs'},
    'rf':  {'n_estimators': 100, 'max_depth': None},
    'xgb': {'learning_rate': 0.1, 'n_estimators': 100},
}


def _parse_ratio(val):
    if pd.isna(val) or val == '-':
        return float('nan')
    m = re.search(r'\((\d+)%\)', str(val))
    return float(m.group(1)) if m else float('nan')


def _parse_result(score: str) -> str:
    home, away = map(int, str(score).split('-'))
    if home > away:
        return 'H'
    if home == away:
        return 'D'
    return 'A'


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

    return bundle, profiles, df


_bundle, _player_profiles, _df = _load()

_train_cache: dict = {}


def _cache_key(model_type: str, params: dict) -> str:
    return f"{model_type}_{'_'.join(f'{k}={v}' for k, v in sorted(params.items()))}"


def _get_or_train(model_type: str, params: dict) -> dict:
    key = _cache_key(model_type, params)
    if key in _train_cache:
        return _train_cache[key]

    feat_cols = _bundle['feature_cols']
    X      = _df[feat_cols].fillna(0)
    y      = _df['score'].apply(_parse_result)
    groups = _df['match_id']

    gss = GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=42)
    train_idx, test_idx = next(gss.split(X, y, groups))

    X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
    y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]

    if model_type == 'lr':
        model = LogisticRegression(max_iter=1000, **params)
    elif model_type == 'rf':
        model = RandomForestClassifier(random_state=42, **params)
    elif model_type == 'xgb':
        le = LabelEncoder()
        y_train_enc = le.fit_transform(y_train)
        y_test_enc  = le.transform(y_test)
        model = XGBClassifier(random_state=42, eval_metric='mlogloss', **params)
        model.fit(X_train, y_train_enc)
        accuracy = round(float((model.predict(X_test) == y_test_enc).mean()) * 100, 1)
        result = {
            'model':        model,
            'feature_cols': feat_cols,
            'classes':      list(le.classes_),
            'label_encoder': le,
            'accuracy':     accuracy,
        }
        _train_cache[key] = result
        return result
    else:
        raise ValueError(f'Unknown model type: {model_type}')

    model.fit(X_train, y_train)
    accuracy = round(float((model.predict(X_test) == y_test).mean()) * 100, 1)

    result = {
        'model':      model,
        'feature_cols': feat_cols,
        'classes':    list(model.classes_),
        'accuracy':   accuracy,
    }
    _train_cache[key] = result
    return result


def get_player_names() -> list[str]:
    return sorted(_player_profiles['player'].tolist())


def predict_match(
    home_players: list[str],
    away_players: list[str],
    model_type: str | None = None,
    params: dict | None = None,
) -> dict:
    if model_type is None:
        bundle   = _bundle
        accuracy = None
    else:
        bundle   = _get_or_train(model_type, params or DEFAULT_PARAMS[model_type])
        accuracy = bundle['accuracy']

    model     = bundle['model']
    feat_cols = bundle['feature_cols']
    classes   = bundle['classes']

    rows = []
    for name in home_players + away_players:
        profile = _player_profiles[_player_profiles['player'] == name]
        if profile.empty:
            rows.append({f: 0.0 for f in feat_cols})
        else:
            rows.append(profile[feat_cols].fillna(0).iloc[0].to_dict())

    le       = bundle.get('label_encoder')
    X_pred   = pd.DataFrame(rows)[feat_cols]
    probas   = model.predict_proba(X_pred)
    avg_prob = probas.mean(axis=0)
    # XGB returns proba columns in label-encoded order; map back via le
    col_classes = le.classes_ if le is not None else classes
    result   = {cls: round(float(p) * 100, 1) for cls, p in zip(col_classes, avg_prob)}

    if accuracy is not None:
        result['accuracy'] = accuracy

    return result
