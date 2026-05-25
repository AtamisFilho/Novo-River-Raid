extends Node2D
# FuelDepot — a beautiful fuel station structure that floats on the river.

signal collected(player_idx: int)

const FUEL_AMOUNT: float = 50.0
const SCORE_VALUE: int = 200
const DEPOT_W: float = 36.0
const DEPOT_H: float = 28.0
const COLLECT_RADIUS: float = 22.0

var scroll_speed: float = 120.0
var blink_timer: float = 0.0
var blink_state: bool = true
var collected_by: Array = [false, false]

func _ready() -> void:
	add_to_group("depots")

func _process(delta: float) -> void:
	scroll_speed = GameSettings.get_scroll_speed()
	position.y += scroll_speed * delta
	blink_timer += delta
	if blink_timer > 0.5:
		blink_timer = 0.0
		blink_state = !blink_state
	queue_redraw()

	# Self-destruct if off screen
	if position.y > 780:
		queue_free()

func check_player_collision(player_pos: Vector2, player_idx: int) -> bool:
	if collected_by[player_idx]:
		return false
	if position.distance_to(player_pos) < COLLECT_RADIUS:
		collected_by[player_idx] = true
		GameState.add_fuel(player_idx, FUEL_AMOUNT)
		GameState.add_score(player_idx, SCORE_VALUE)
		emit_signal("collected", player_idx)
		return true
	return false

func _draw() -> void:
	# Base platform (green rectangle, spans river edge)
	draw_rect(Rect2(-DEPOT_W, -6, DEPOT_W * 2, 10), Palette.DEPOT_PLATFORM)

	# Platform highlights
	draw_line(Vector2(-DEPOT_W, -6), Vector2(DEPOT_W, -6), Palette.JUNGLE_EDGE, 1.5)
	draw_line(Vector2(-DEPOT_W, 4), Vector2(DEPOT_W, 4), Palette.JUNGLE_SHADOW, 1.0)

	# Central tower (white cylinder-ish)
	draw_rect(Rect2(-8, -28, 16, 28), Palette.DEPOT_TOWER)

	# Tower shadow/shading
	draw_rect(Rect2(5, -28, 3, 28), Color(0, 0, 0, 0.2))
	draw_rect(Rect2(-8, -28, 3, 28), Color(1, 1, 1, 0.15))

	# Red cross on tower
	draw_rect(Rect2(-6, -22, 12, 3), Palette.DEPOT_CROSS)   # horizontal
	draw_rect(Rect2(-1.5, -26, 3, 11), Palette.DEPOT_CROSS)  # vertical

	# "F" letter on tower (drawn manually)
	_draw_letter_f(Vector2(-4, -14))

	# Blinking red light on top
	var light_color = Palette.DEPOT_LIGHT_ON if blink_state else Palette.DEPOT_LIGHT_OFF
	draw_circle(Vector2(0, -32), 4.0, light_color)
	if blink_state:
		var glow = Palette.DEPOT_LIGHT_ON
		glow.a = 0.3
		draw_circle(Vector2(0, -32), 7.0, glow)

	# Small support struts
	draw_line(Vector2(-8, -6), Vector2(-14, -6), Palette.DEPOT_TOWER, 2.0)
	draw_line(Vector2(8, -6), Vector2(14, -6), Palette.DEPOT_TOWER, 2.0)
	draw_line(Vector2(-14, -6), Vector2(-18, 4), Palette.DEPOT_TOWER, 1.5)
	draw_line(Vector2(14, -6), Vector2(18, 4), Palette.DEPOT_TOWER, 1.5)

func _draw_letter_f(pos: Vector2) -> void:
	var c = Palette.DEPOT_TEXT
	# Top horizontal bar
	draw_line(pos, pos + Vector2(6, 0), c, 1.5)
	# Middle horizontal bar
	draw_line(pos + Vector2(0, 4), pos + Vector2(5, 4), c, 1.5)
	# Vertical bar
	draw_line(pos, pos + Vector2(0, 8), c, 1.5)
