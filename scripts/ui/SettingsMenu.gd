extends Node2D
# SettingsMenu — difficulty and player count settings.

const VIEWPORT_W: float = 480.0
const VIEWPORT_H: float = 720.0

var font: Font
var hovered: int = -1
var buttons: Array = []

const DIFF_NAMES = ["EASY", "NORMAL", "HARD"]

func _ready() -> void:
	font = ThemeDB.fallback_font
	_create_buttons()

func _create_buttons() -> void:
	buttons.clear()

	# Difficulty buttons
	for i in DIFF_NAMES.size():
		buttons.append({
			"label": DIFF_NAMES[i],
			"rect": Rect2(VIEWPORT_W * 0.5 - 75 + i * 80 - 80, 280, 70, 40),
			"type": "diff",
			"value": i
		})

	# Player count buttons
	buttons.append({
		"label": "1 PLAYER",
		"rect": Rect2(VIEWPORT_W * 0.5 - 100, 380, 90, 40),
		"type": "players",
		"value": 1
	})
	buttons.append({
		"label": "2 PLAYERS",
		"rect": Rect2(VIEWPORT_W * 0.5 + 10, 380, 90, 40),
		"type": "players",
		"value": 2
	})

	# Back button
	buttons.append({
		"label": "BACK",
		"rect": Rect2(VIEWPORT_W * 0.5 - 60, 500, 120, 48),
		"type": "back",
		"value": 0
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
				_on_button(buttons[i])
				break

func _on_button(btn: Dictionary) -> void:
	match btn.type:
		"diff":
			GameSettings.apply_preset(btn.value)
			GameSettings.save_settings()
			queue_redraw()
		"players":
			GameSettings.player_count = btn.value
			GameSettings.save_settings()
			queue_redraw()
		"back":
			get_tree().change_scene_to_file("res://scenes/MainMenu.tscn")

func _process(_delta: float) -> void:
	queue_redraw()

func _draw() -> void:
	# Background
	draw_rect(Rect2(0, 0, VIEWPORT_W, VIEWPORT_H), Palette.MENU_BG)

	# Grid pattern overlay
	for i in range(0, int(VIEWPORT_W), 40):
		draw_line(Vector2(i, 0), Vector2(i, VIEWPORT_H), Color(0.1, 0.15, 0.3, 0.15), 1.0)
	for j in range(0, int(VIEWPORT_H), 40):
		draw_line(Vector2(0, j), Vector2(VIEWPORT_W, j), Color(0.1, 0.15, 0.3, 0.15), 1.0)

	if font == null:
		return

	# Title
	draw_string(font, Vector2(VIEWPORT_W * 0.5 - 60, 100), "SETTINGS",
		HORIZONTAL_ALIGNMENT_LEFT, -1, 32, Palette.MENU_TITLE)
	draw_line(Vector2(60, 115), Vector2(VIEWPORT_W - 60, 115),
		Color(0.6, 0.5, 0.2, 0.5), 1.5)

	# Difficulty label
	draw_string(font, Vector2(VIEWPORT_W * 0.5 - 60, 240), "DIFFICULTY",
		HORIZONTAL_ALIGNMENT_LEFT, -1, 16, Palette.HUD_TEXT)

	# Player count label
	draw_string(font, Vector2(VIEWPORT_W * 0.5 - 60, 360), "PLAYERS",
		HORIZONTAL_ALIGNMENT_LEFT, -1, 16, Palette.HUD_TEXT)

	# Draw buttons
	for i in buttons.size():
		var btn = buttons[i]
		var is_hovered = (i == hovered)
		var is_selected = false

		if btn.type == "diff":
			is_selected = (GameSettings.difficulty == btn.value)
		elif btn.type == "players":
			is_selected = (GameSettings.player_count == btn.value)

		var bg: Color
		if is_selected:
			bg = Color(0.2, 0.5, 0.8, 0.9)
		elif is_hovered:
			bg = Palette.MENU_BUTTON_HV
		else:
			bg = Palette.MENU_BUTTON

		var r: Rect2 = btn.rect
		draw_rect(r, bg)
		draw_rect(r, Color(0.4, 0.5, 0.7, 0.6), false, 1.5)

		var text_x = r.position.x + r.size.x * 0.5 - btn.label.length() * 4
		var text_y = r.position.y + r.size.y * 0.5 + 5
		draw_string(font, Vector2(text_x, text_y), btn.label,
			HORIZONTAL_ALIGNMENT_LEFT, -1, 13, Palette.MENU_BUTTON_TX)

	# Current settings info
	var diff_name = DIFF_NAMES[GameSettings.difficulty] if GameSettings.difficulty < DIFF_NAMES.size() else "CUSTOM"
	var info = "Current: %s  |  %d Player(s)" % [diff_name, GameSettings.player_count]
	draw_string(font, Vector2(VIEWPORT_W * 0.5 - 100, 460), info,
		HORIZONTAL_ALIGNMENT_LEFT, -1, 12, Color(0.6, 0.7, 0.8))
