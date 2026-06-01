# Flashscore Player Stats — Match Result Predictor

Dados de estatísticas individuais de jogadores retirados do Flashscore (liga portuguesa), com um pipeline de Machine Learning para prever o resultado de jogos (Vitória Casa / Empate / Vitória Fora).

---

## Estrutura do projeto

```
├── player_stats.csv      # Dataset com stats por jogador por jogo
├── players-ml.ipynb      # Notebook principal de ML
└── scrape-pt.ipynb       # Notebook de scraping dos dados
```

---

## Dataset — `player_stats.csv`

Cada linha representa as estatísticas de **um jogador num jogo específico**.

| Coluna | Descrição |
|---|---|
| `player` | Nome do jogador |
| `position` | Posição em campo |
| `rating` | Nota do jogador no jogo (ex: 7.8) |
| `total_remates` | Total de remates |
| `xG` | Expected Goals |
| `passes_certos` | Passes certos no formato `completados/tentativas (%)` |
| `toques` | Número de toques na bola |
| `toques_area_adv` | Toques na área adversária |
| `dribles` | Dribles no formato `sucedidos/tentativas (%)` |
| `duelos` | Duelos no formato `ganhos/totais (%)` |
| `match_id` | Identificador único do jogo |
| `home` | Equipa da casa |
| `away` | Equipa de fora |
| `score` | Resultado final (ex: `2-0`) |

---

## Pipeline ML — `players-ml.ipynb`

### 1. Carregamento e limpeza
- Leitura do CSV para um DataFrame pandas
- Substituição de valores em falta (`-`) por `NaN`
- Parsing das colunas de rácio (`passes_certos`, `dribles`, `duelos`) — extrai a percentagem como float

### 2. Feature engineering
- Criação da variável alvo `result`: `H` (vitória casa), `D` (empate), `A` (vitória fora)
- Codificação da posição como variável numérica (`position_enc`)

### 3. Train/Test split
- Split feito **por `match_id`** (via `GroupShuffleSplit`) para evitar data leakage — jogadores do mesmo jogo ficam sempre no mesmo split

### 4. Modelos treinados
| Modelo | Notas |
|---|---|
| Logistic Regression | Baseline linear |
| Random Forest | Principal modelo; fornece feature importance |
| XGBoost | Gradient boosting para dados tabulares |

Avaliação com `accuracy`, `classification_report` e gráfico de feature importance.

### 5. Predição 11 vs 11
Função `predict_match(home_players, away_players)`:
- Recebe duas listas de 11 nomes de jogadores
- Busca o perfil médio histórico de cada jogador
- Corre `predict_proba` para cada um dos 22 jogadores
- Agrega as probabilidades e devolve as % de H / D / A

```python
predict_match(
    home_players=['Jogador A', 'Jogador B', ...],  # 11 da casa
    away_players=['Jogador X', 'Jogador Y', ...]   # 11 de fora
)
# Output:
#   Vitória Casa (H): 45.2%
#   Empate       (D): 22.1%
#   Vitória Fora (A): 32.7%
```

---

## Requisitos

```
pandas
scikit-learn
xgboost
matplotlib
```

Instalar com:
```bash
pip install pandas scikit-learn xgboost matplotlib
```
