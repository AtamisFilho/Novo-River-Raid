extends Node2D
# MainMenu — title screen with NEW GAME, SETTINGS, QUIT buttons.

const VIEWPORT_W: float = 480.0
const VIEWPORT_H: float = 720.0

var buttons: Array = []
var hovered: int = -1
var font: Font
var title_anim: float = 0.0

# River preview data (static segments for background)
var preview_segments: Array = []
var preview_scroll: float = 0.0

func _ready() -> void:
	font = ThemeDB.fallback_font
	_generate_preview()
	_create_buttons()

func _generate_preview() -> void:
	var rng = RandomNumberGenerator.new()
	rng.seed = 12345
	var cx = VIEWPORT_W * 0.5
	var w = 170.0
	preview_segments.clear()
	for i in 35:
		preview_segments.append({
			"left": cx - w * 0.5,
			"right": cx + w * 0.5,
			"y": float(i) * 22.0
		})
		cx += rng.randf_range(-7.0, 7.0)
		cx = clamp(cx, 100, 380)
		w += rng.randf_range(-5.0, 5.0)
		w = clamp(w, 130.0, 210.0)

func _create_buttons() -> void:
	var btn_labels = ["NEW GAME", "SETTINGS", "QUIT"]
	var start_y = 460.0
	for i in btn_labels.size():
		buttons.append({
			"label": btn_labels[i],
			"rect": Rect2(VIEWPORT_W * 0.5 - 100, start_y + i * 65.0, 200, 48),
			"action": i
		})

func _process(delta: float) -> void:
	title_anim += delta
	preview_scroll = fmod(preview_scroll + 60.0 * delta, 22.0)
	queue_redraw()

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
				_on_button_pressed(i)
				break

func _on_button_pressed(idx: int) -> void:
	match idx:
		0: get_tree().change_scene_to_file("res://scenes/Main.tscn")
		1: get_tree().change_scene_to_file("res://scenes/SettingsMenu.tscn")
		2: get_tree().quit()

func _draw() -> void:
	_draw_background()
	_draw_title()
	_draw_buttons()

func _draw_background() -> void:
	# Sky gradient
	for i in 24:
		var t = float(i) / 24.0
		var y = t * VIEWPORT_H * 0.65
		var c = Palette.SKY_TOP.lerp(Palette.SKY_HORIZON, t)
		draw_rect(Rect2(0, y, VIEWPORT_W, VIEWPORT_H / 24.0 + 1), c)

	# Draw preview river
	if preview_segments.size() < 2:
		return

	for i in range(preview_segments.size() - 1):
		var s0 = preview_segments[i]
		var s1 = preview_segments[i + 1]
		var y0 = s0.y - preview_scroll
		var y1 = s1.y - preview_scroll

		# Left terrain
		draw_polygon(PackedVector2Array([
			Vector2(0, y0), Vector2(s0.left, y0),
			Vector2(s1.left, y1), Vector2(0, y1)
		]), PackedColorArray([Palette.JUNGLE_FAR, Palette.JUNGLE_FAR,
			Palette.JUNGLE_FAR, Palette.JUNGLE_FAR]))

		# Right terrain
		draw_polygon(PackedVector2Array([
			Vector2(s0.right, y0), Vector2(VIEWPORT_W, y0),
			Vector2(VIEWPORT_W, y1), Vector2(s1.right, y1)
		]), PackedColorArray([Palette.JUNGLE_FAR, Palette.JUNGLE_FAR,
			Palette.JUNGLE_FAR, Palette.JUNGLE_FAR]))

		# River water
		draw_polygon(PackedVector2Array([
			Vector2(s0.left + 12, y0), Vector2(s0.right - 12, y0),
			Vector2(s1.right - 12, y1), Vector2(s1.left + 12, y1)
		]), PackedColorArray([Palette.RIVER_MID, Palette.RIVER_MID,
			Palette.RIVER_MID, Palette.RIVER_MID]))

	# Darken bottom half for readability
	draw_rect(Rect2(0, VIEWPORT_H * 0.35, VIEWPORT_W, VIEWPORT_H * 0.65),
		Color(0, 0, 0.05, 0.7))

func _draw_title() -> void:
	# Title backdrop glow
	var glow_alpha = 0.15 + 0.08 * sin(title_anim * 1.5)
	draw_rect(Rect2(40, 120, VIEWPORT_W - 80, 150), Color(0.8, 0.6, 0.0, glow_alpha))

	# Game title — large stylized text
	if font == null:
		return

	var title = "RIVER RAID"
	var subtitle = "RELOADED"

	# Title shadow
	draw_string(font, Vector2(VIEWPORT_W * 0.5 - 120 + 3, 218), title,
		HORIZONTAL_ALIGNMENT_LEFT, -1, 48, Color(0, 0, 0, 0.6))
	# Title main color
	draw_string(font, Vector2(VIEWPORT_W * 0.5 - 120, 215), title,
		HORIZONTAL_ALIGNMENT_LEFT, -1, 48, Palette.MENU_TITLE)
	# Title shine effect
	draw_string(font, Vector2(VIEWPORT_W * 0.5 - 120, 213), title,
		HORIZONTAL_ALIGNMENT_LEFT, -1, 48, Color(1, 1, 0.8, 0.3))

	# Subtitle
	draw_string(font, Vector2(VIEWPORT_W * 0.5 - 58, 252), subtitle,
		HORIZONTAL_ALIGNMENT_LEFT, -1, 20, Color(0.8, 0.7, 0.3))

	# Decorative lines
	var line_y = 265.0
	draw_line(Vector2(60, line_y), Vector2(VIEWPORT_W - 60, line_y),
		Color(0.6, 0.5, 0.2, 0.6), 2.0)

	# "PRESS TO START" hint
	var hint_alpha = 0.5 + 0.5 * abs(sin(title_anim * 2.0))
	draw_string(font, Vector2(VIEWPORT_W * 0.5 - 90, 420), "CLICK TO PLAY",
		HORIZONTAL_ALIGNMENT_LEFT, -1, 14, Color(0.8, 0.9, 1.0, hint_alpha))

func _draw_buttons() -> void:
	if font == null:
		return
	for i in buttons.size():
		var btn = buttons[i]
		var is_hovered = (i == hovered)
		var bg_color = Palette.MENU_BUTTON_HV if is_hovered else Palette.MENU_BUTTON
		var r: Rect2 = btn.rect

		# Button background
		draw_rect(r, bg_color)
		# Button border
		draw_rect(r, Color(0.4, 0.5, 0.7, 0.6), false, 1.5)

		# Hover highlight
		if is_hovered:
			draw_rect(Rect2(r.position.x, r.position.y, r.size.x, 3),
				Color(0.6, 0.7, 1.0, 0.3))

		# Button text centered
		var text_x = r.position.x + r.size.x * 0.5 - btn.label.length() * 5
		var text_y = r.position.y + r.size.y * 0.5 + 6
		draw_string(font, Vector2(text_x, text_y), btn.label,
			HORIZONTAL_ALIGNMENT_LEFT, -1, 16, Palette.MENU_BUTTON_TX)
