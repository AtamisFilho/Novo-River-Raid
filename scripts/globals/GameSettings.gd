extends Node
# GameSettings singleton — difficulty, player count, save/load

enum Difficulty { EASY, NORMAL, HARD, CUSTOM }

# Current difficulty
var difficulty: int = Difficulty.NORMAL
var player_count: int = 1

# Multipliers (overridden by difficulty presets)
var scroll_speed_mult: float = 1.0
var enemy_density_mult: float = 1.0
var fuel_consumption_mult: float = 1.0
var enemy_speed_mult: float = 1.0

# Base values
const BASE_SCROLL_SPEED: float = 120.0   # px/s
const BASE_ENEMY_DENSITY: float = 1.0
const BASE_FUEL_CONSUMPTION: float = 1.0  # units/s
const BASE_ENEMY_SPEED: float = 60.0      # px/s

# Difficulty presets: [scroll, density, fuel, enemy_speed]
const PRESETS = {
	Difficulty.EASY:   [0.75, 0.60, 0.75, 0.70],
	Difficulty.NORMAL: [1.00, 1.00, 1.00, 1.00],
	Difficulty.HARD:   [1.40, 1.60, 1.30, 1.40],
	Difficulty.CUSTOM: [1.00, 1.00, 1.00, 1.00],  # user-edited
}

func _ready() -> void:
	load_settings()

func apply_preset(diff: int) -> void:
	difficulty = diff
	if diff in PRESETS:
		var p = PRESETS[diff]
		scroll_speed_mult      = p[0]
		enemy_density_mult     = p[1]
		fuel_consumption_mult  = p[2]
		enemy_speed_mult       = p[3]

func get_scroll_speed() -> float:
	return BASE_SCROLL_SPEED * scroll_speed_mult

func get_enemy_speed() -> float:
	return BASE_ENEMY_SPEED * enemy_speed_mult

func save_settings() -> void:
	var cfg = ConfigFile.new()
	cfg.set_value("game", "difficulty",            difficulty)
	cfg.set_value("game", "player_count",          player_count)
	cfg.set_value("custom", "scroll_speed_mult",   scroll_speed_mult)
	cfg.set_value("custom", "enemy_density_mult",  enemy_density_mult)
	cfg.set_value("custom", "fuel_consumption_mult", fuel_consumption_mult)
	cfg.set_value("custom", "enemy_speed_mult",    enemy_speed_mult)
	cfg.save("user://settings.cfg")

func load_settings() -> void:
	var cfg = ConfigFile.new()
	if cfg.load("user://settings.cfg") != OK:
		apply_preset(Difficulty.NORMAL)
		return
	difficulty            = cfg.get_value("game", "difficulty",            Difficulty.NORMAL)
	player_count          = cfg.get_value("game", "player_count",          1)
	scroll_speed_mult     = cfg.get_value("custom", "scroll_speed_mult",   1.0)
	enemy_density_mult    = cfg.get_value("custom", "enemy_density_mult",  1.0)
	fuel_consumption_mult = cfg.get_value("custom", "fuel_consumption_mult",1.0)
	enemy_speed_mult      = cfg.get_value("custom", "enemy_speed_mult",    1.0)
	# If not custom, re-apply preset to ensure consistency
	if difficulty != Difficulty.CUSTOM:
		apply_preset(difficulty)
