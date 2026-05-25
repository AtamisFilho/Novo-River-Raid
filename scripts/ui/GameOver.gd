extends Node2D
# GameOver — shows final scores, PLAY AGAIN and MAIN MENU buttons.

const VIEWPORT_W: float = 480.0
const VIEWPORT_H: float = 720.0

var font: Font
var hovered: int = -1
var buttons: Array = []
var anim: float = 0.0

func _ready() -> void:
	font = ThemeDB.fallback_font
	_create_buttons()

func _create_buttons() -> void:
	buttons.append({
		"label": "PLAY AGAIN",
		"rect": Rect2(VIEWPORT_W * 0.5 - 110, 520, 100, 48),
		"action": 0
	})
	buttons.append({
		"label": "MAIN MENU",
		"rect": Rect2(VIEWPORT_W * 0.5 + 10, 520, 100, 48),
		"action": 1
	})

func _input(event: InputEvent) -> void:
	if event is InputEventMouseMotion:
		hovered = -1
		for i in buttons.size():
			if buttons[i].rect.has_point(event.position):
				hovered = i
				break
		queue_redraw()

	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		for i in buttons.size():
			if buttons[i].rect.has_point(event.position):
				_on_button(i)
				break

func _on_button(idx: int) -> void:
	match idx:
		0:
			GameState.reset()
			get_tree().change_scene_to_file("res://scenes/Main.tscn")
		1:
			get_tree().change_scene_to_file("res://scenes/MainMenu.tscn")

func _process(delta: float) -> void:
	anim += delta
	queue_redraw()

func _draw() -> void:
	# Dark background
	draw_rect(Rect2(0, 0, VIEWPORT_W, VIEWPORT_H), Color(0.02, 0.02, 0.08))

	# Animated scan lines
	for i in range(0, int(VIEWPORT_H), 4):
		draw_rect(Rect2(0, float(i), VIEWPORT_W, 1), Color(0, 0, 0, 0.3))

	if font == null:
		return

	# "GAME OVER" text with glow effect
	var pulse = 0.7 + 0.3 * sin(anim * 2.0)
	var go_color = Color(0.9, 0.1, 0.1, pulse)

	# Shadow
	draw_string(font, Vector2(VIEWPORT_W * 0.5 - 95 + 3, 183), "GAME OVER",
		HORIZONTAL_ALIGNMENT_LEFT, -1, 44, Color(0.5, 0, 0, 0.5))
	# Main
	draw_string(font, Vector2(VIEWPORT_W * 0.5 - 95, 180), "GAME OVER",
		HORIZONTAL_ALIGNMENT_LEFT, -1, 44, go_color)

	# Decorative lines
	draw_line(Vector2(40, 200), Vector2(VIEWPORT_W - 40, 200),
		Color(0.5, 0.1, 0.1, 0.6), 1.5)

	# Scores
	var y_offset = 260.0
	for i in GameSettings.player_count:
		var pname = "PLAYER %d" % (i + 1)
		var score_str = "%07d" % GameState.scores[i]
		var dist_str = "%.1f km" % GameState.get_distance_km(i)

		draw_string(font, Vector2(VIEWPORT_W * 0.5 - 120, y_offset), pname,
			HORIZONTAL_ALIGNMENT_LEFT, -1, 16, Palette.HUD_TEXT)
		draw_string(font, Vector2(VIEWPORT_W * 0.5 - 50, y_offset + 30), score_str,
			HORIZONTAL_ALIGNMENT_LEFT, -1, 22, Palette.HUD_SCORE)
		draw_string(font, Vector2(VIEWPORT_W * 0.5 - 50, y_offset + 60), "DIST: " + dist_str,
			HORIZONTAL_ALIGNMENT_LEFT, -1, 14, Color(0.6, 0.8, 1.0))

		y_offset += 110.0

	# Hi-score display (use player with highest score)
	var best_score = 0
	for i in GameSettings.player_count:
		if GameState.scores[i] > best_score:
			best_score = GameState.scores[i]

	draw_string(font, Vector2(VIEWPORT_W * 0.5 - 80, y_offset + 10), "HIGH SCORE",
		HORIZONTAL_ALIGNMENT_LEFT, -1, 13, Color(0.7, 0.7, 0.7))
	draw_string(font, Vector2(VIEWPORT_W * 0.5 - 60, y_offset + 30), "%07d" % best_score,
		HORIZONTAL_ALIGNMENT_LEFT, -1, 20, Palette.MENU_TITLE)

	# Buttons
	for i in buttons.size():
		var btn = buttons[i]
		var is_hovered = (i == hovered)
		var bg = Palette.MENU_BUTTON_HV if is_hovered else Palette.MENU_BUTTON
		var r: Rect2 = btn.rect

		draw_rect(r, bg)
		draw_rect(r, Color(0.4, 0.3, 0.5, 0.7), false, 1.5)

		if is_hovered:
			draw_rect(Rect2(r.position.x, r.position.y, r.size.x, 3),
				Color(0.7, 0.5, 1.0, 0.4))

		var text_x = r.position.x + r.size.x * 0.5 - btn.label.length() * 4
		var text_y = r.position.y + r.size.y * 0.5 + 5
		draw_string(font, Vector2(text_x, text_y), btn.label,
			HORIZONTAL_ALIGNMENT_LEFT, -1, 13, Palette.MENU_BUTTON_TX)
