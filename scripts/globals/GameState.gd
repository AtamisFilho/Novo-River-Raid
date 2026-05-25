extends Node
# GameState singleton — per-player runtime state

signal score_changed(idx: int, val: int)
signal fuel_changed(idx: int, val: float)
signal lives_changed(idx: int, val: int)
signal game_over

const MAX_PLAYERS   = 2
const START_LIVES   = 3
const MAX_FUEL      = 100.0
const START_FUEL    = 80.0

var scores:    Array[int]   = [0, 0]
var lives:     Array[int]   = [START_LIVES, START_LIVES]
var fuel:      Array[float] = [START_FUEL, START_FUEL]
var distances: Array[float] = [0.0, 0.0]
var active:    Array[bool]  = [true, false]   # which players are active
var game_running: bool = false

func reset() -> void:
	for i in MAX_PLAYERS:
		scores[i]    = 0
		lives[i]     = START_LIVES
		fuel[i]      = START_FUEL
		distances[i] = 0.0
	# Determine active players from settings
	active[0] = true
	active[1] = (GameSettings.player_count >= 2)
	game_running = true

# ── Score ──────────────────────────────────────────────────────────────────────
func add_score(idx: int, amount: int) -> void:
	if idx < 0 or idx >= MAX_PLAYERS: return
	scores[idx] += amount
	emit_signal("score_changed", idx, scores[idx])

# ── Fuel ───────────────────────────────────────────────────────────────────────
func drain_fuel(idx: int, amount: float) -> void:
	if idx < 0 or idx >= MAX_PLAYERS: return
	fuel[idx] = max(0.0, fuel[idx] - amount)
	emit_signal("fuel_changed", idx, fuel[idx])
	if fuel[idx] <= 0.0:
		kill_player(idx)

func add_fuel(idx: int, amount: float) -> void:
	if idx < 0 or idx >= MAX_PLAYERS: return
	fuel[idx] = min(MAX_FUEL, fuel[idx] + amount)
	emit_signal("fuel_changed", idx, fuel[idx])

# ── Lives ──────────────────────────────────────────────────────────────────────
func kill_player(idx: int) -> void:
	if idx < 0 or idx >= MAX_PLAYERS: return
	lives[idx] -= 1
	emit_signal("lives_changed", idx, lives[idx])
	if lives[idx] <= 0:
		active[idx] = false
		_check_game_over()

func _check_game_over() -> void:
	var any_alive = false
	for i in MAX_PLAYERS:
		if active[i] and lives[i] > 0:
			any_alive = true
			break
	if not any_alive:
		game_running = false
		emit_signal("game_over")

# ── Distance ───────────────────────────────────────────────────────────────────
func add_distance(idx: int, delta_px: float) -> void:
	if idx < 0 or idx >= MAX_PLAYERS: return
	distances[idx] += delta_px

func get_distance_km(idx: int) -> float:
	return distances[idx] / 1000.0  # 1000 px = 1 "km"
