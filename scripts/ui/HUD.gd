extends CanvasLayer
# HUD — draws score, lives, fuel bar, and distance counter.

var font: Font

# Cache display values
var scores: Array = [0, 0]
var lives: Array = [3, 3]
var fuel: Array = [80.0, 80.0]
var distances: Array = [0.0, 0.0]

const VIEWPORT_W: float = 480.0
const VIEWPORT_H: float = 720.0
const HUD_HEIGHT: float = 52.0
const BAR_W: float = 100.0
const BAR_H: float = 10.0

# We draw on a Control node
var draw_node: Control

func _ready() -> void:
	# Create a Control node to draw on
	draw_node = Control.new()
	draw_node.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	draw_node.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(draw_node)
	draw_node.draw.connect(_on_draw)

	# Connect signals
	GameState.score_changed.connect(_on_score_changed)
	GameState.fuel_changed.connect(_on_fuel_changed)
	GameState.lives_changed.connect(_on_lives_changed)

func _process(_delta: float) -> void:
	for i in GameState.MAX_PLAYERS:
		distances[i] = GameState.get_distance_km(i)
	draw_node.queue_redraw()

func _on_score_changed(idx: int, val: int) -> void:
	scores[idx] = val

func _on_fuel_changed(idx: int, val: float) -> void:
	fuel[idx] = val

func _on_lives_changed(idx: int, val: int) -> void:
	lives[idx] = val

func _on_draw() -> void:
	_draw_top_bar()
	_draw_player_hud(0, 0.0)
	if GameSettings.player_count >= 2:
		_draw_player_hud(1, VIEWPORT_W * 0.5)

func _draw_top_bar() -> void:
	# Semi-transparent background bar
	draw_node.draw_rect(Rect2(0, 0, VIEWPORT_W, HUD_HEIGHT), Palette.HUD_BG)
	# Bottom border line
	draw_node.draw_line(Vector2(0, HUD_HEIGHT), Vector2(VIEWPORT_W, HUD_HEIGHT),
		Color(0.3, 0.4, 0.6, 0.5), 1.5)

func _draw_player_hud(idx: int, x_off: float) -> void:
	if not GameState.active[idx] and idx >= GameSettings.player_count:
		return

	var col_w = VIEWPORT_W / float(GameSettings.player_count)
	var base_x = x_off + 8.0
	var base_y = 6.0

	# Player label
	var label = "P%d" % (idx + 1)
	_draw_text(label, Vector2(base_x, base_y + 12), 11, Palette.HUD_TEXT)

	# Score
	var score_str = "%07d" % scores[idx]
	_draw_text(score_str, Vector2(base_x + 22, base_y + 12), 11, Palette.HUD_SCORE)

	# Lives (airplane icons)
	for i in lives[idx]:
		_draw_mini_plane(Vector2(base_x + i * 16 + 22, base_y + 28), idx)

	# Fuel bar
	var fuel_x = base_x + col_w - BAR_W - 16.0
	var fuel_pct = fuel[idx] / GameState.MAX_FUEL

	# Bar background
	draw_node.draw_rect(Rect2(fuel_x - 1, base_y + 20, BAR_W + 2, BAR_H + 2),
		Color(0.1, 0.1, 0.15))
	# Bar border
	draw_node.draw_rect(Rect2(fuel_x - 1, base_y + 20, BAR_W + 2, BAR_H + 2),
		Palette.FUEL_BORDER, false, 1.0)

	# Bar fill with gradient color
	var bar_color: Color
	if fuel_pct > 0.5:
		bar_color = Palette.FUEL_HIGH.lerp(Palette.FUEL_MID, (1.0 - fuel_pct) * 2.0)
	else:
		bar_color = Palette.FUEL_MID.lerp(Palette.FUEL_LOW, (0.5 - fuel_pct) * 2.0)

	if fuel_pct > 0.01:
		draw_node.draw_rect(Rect2(fuel_x, base_y + 21, BAR_W * fuel_pct, BAR_H), bar_color)
		# Highlight strip on bar
		draw_node.draw_rect(Rect2(fuel_x, base_y + 21, BAR_W * fuel_pct, 3),
			Color(bar_color.r * 1.3, bar_color.g * 1.3, bar_color.b * 1.3, 0.5))

	# "FUEL" label
	_draw_text("FUEL", Vector2(fuel_x - 28, base_y + 30), 9, Palette.HUD_TEXT)

	# Distance
	var dist_str = "%.1fkm" % distances[idx]
	_draw_text(dist_str, Vector2(base_x, base_y + 44), 9, Color(0.7, 0.85, 1.0))

func _draw_mini_plane(pos: Vector2, _idx: int) -> void:
	# Tiny airplane icon
	var c = Palette.PLAYER_BODY
	draw_node.draw_polygon(PackedVector2Array([
		pos + Vector2(0, -5),
		pos + Vector2(-6, 2),
		pos + Vector2(-2, 0),
		pos + Vector2(0, 3),
		pos + Vector2(2, 0),
		pos + Vector2(6, 2)
	]), PackedColorArray([c, c, c, c, c, c]))

func _draw_text(text: String, pos: Vector2, size: int, color: Color) -> void:
	# Draw each character manually using simple pixel-style rendering
	# Use Godot's default font via a label trick — draw using draw_string
	if font == null:
		font = ThemeDB.fallback_font
	if font:
		draw_node.draw_string(font, pos, text, HORIZONTAL_ALIGNMENT_LEFT, -1, size, color)
