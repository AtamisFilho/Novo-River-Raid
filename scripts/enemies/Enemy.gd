extends Node2D
# Enemy — three types: BOAT, HELI, JET. All drawn procedurally.

enum EnemyType { BOAT, HELI, JET }

var enemy_type: EnemyType = EnemyType.BOAT
var health: int = 1
var scroll_speed: float = 120.0
var move_timer: float = 0.0
var lateral_speed: float = 0.0
var lateral_dir: float = 1.0
var rotor_angle: float = 0.0
var exhaust_anim: float = 0.0
var wake_offset: float = 0.0

# Points per enemy type
const POINTS := {EnemyType.BOAT: 100, EnemyType.HELI: 150, EnemyType.JET: 250}
const COLLISION_RADIUS := {EnemyType.BOAT: 14.0, EnemyType.HELI: 16.0, EnemyType.JET: 18.0}

func _ready() -> void:
	add_to_group("enemies")
	var rng := RandomNumberGenerator.new()
	rng.randomize()
	lateral_speed = GameSettings.get_enemy_speed() * rng.randf_range(0.3, 0.7)
	lateral_dir = 1.0 if rng.randf() > 0.5 else -1.0
	move_timer = rng.randf_range(0.5, 2.0)

func _process(delta: float) -> void:
	scroll_speed = GameSettings.get_scroll_speed()
	rotor_angle += delta * 8.0
	exhaust_anim += delta * 4.0
	wake_offset = fmod(wake_offset + delta * 60.0, 20.0)

	# Move downward with scroll
	position.y += scroll_speed * delta

	# Type-specific lateral movement
	match enemy_type:
		EnemyType.BOAT:
			_update_boat(delta)
		EnemyType.HELI:
			_update_heli(delta)
		EnemyType.JET:
			_update_jet(delta)

	# Recycle if off screen
	if position.y > 760:
		queue_free()

	queue_redraw()

func _update_boat(delta: float) -> void:
	# Slow side-to-side drift
	move_timer -= delta
	if move_timer <= 0:
		lateral_dir *= -1.0
		move_timer = randf_range(1.0, 3.0)  # GDScript global randf_range is fine
	position.x += lateral_dir * lateral_speed * delta * 0.5

func _update_heli(delta: float) -> void:
	# Moderate weaving
	position.x += sin(position.y * 0.03) * lateral_speed * delta

func _update_jet(delta: float) -> void:
	# Fast weaving
	move_timer -= delta
	if move_timer <= 0:
		lateral_dir *= -1.0
		move_timer = randf_range(0.4, 1.2)  # GDScript global randf_range
	position.x += lateral_dir * lateral_speed * delta * 1.5

func hit() -> bool:
	health -= 1
	if health <= 0:
		queue_free()
		return true
	return false

func get_collision_radius() -> float:
	return COLLISION_RADIUS[enemy_type]

func get_points() -> int:
	return POINTS[enemy_type]

func _draw() -> void:
	match enemy_type:
		EnemyType.BOAT:
			_draw_boat()
		EnemyType.HELI:
			_draw_heli()
		EnemyType.JET:
			_draw_jet()

# ─── BOAT ───────────────────────────────────────────────────────────────────
func _draw_boat() -> void:
	# Hull — red elongated shape
	var hull = PackedVector2Array([
		Vector2(-14, -5),
		Vector2(-10, -9),
		Vector2(10, -9),
		Vector2(14, -5),
		Vector2(14, 5),
		Vector2(-14, 5)
	])
	draw_colored_polygon(hull, Palette.BOAT_HULL)

	# Dark stripe across middle
	draw_rect(Rect2(-12, -2, 24, 4), Palette.BOAT_STRIPE)

	# Cabin
	var cabin = PackedVector2Array([
		Vector2(-5, -9),
		Vector2(-2, -14),
		Vector2(2, -14),
		Vector2(5, -9)
	])
	draw_colored_polygon(cabin, Palette.BOAT_STRIPE)

	# Hull highlight
	draw_line(Vector2(-12, -8), Vector2(10, -8), Color(1, 0.5, 0.5, 0.4), 1.0)

	# Wake lines (animate)
	for i in range(3):
		var w_y = 5.0 + float(i) * 7.0 + wake_offset * 0.3
		var w_a = 0.5 - float(i) * 0.15
		var wc = Palette.BOAT_WAKE
		wc.a = w_a
		draw_line(Vector2(-8, w_y), Vector2(-14, w_y + 3), wc, 1.0)
		draw_line(Vector2(8, w_y), Vector2(14, w_y + 3), wc, 1.0)

# ─── HELICOPTER ─────────────────────────────────────────────────────────────
func _draw_heli() -> void:
	# Tail boom
	draw_rect(Rect2(6, -3, 14, 5), Palette.HELI_BODY)

	# Main body
	var body = PackedVector2Array([
		Vector2(-10, -8),
		Vector2(8, -8),
		Vector2(10, -4),
		Vector2(10, 6),
		Vector2(-10, 6),
		Vector2(-12, 0)
	])
	draw_colored_polygon(body, Palette.HELI_BODY)

	# Cockpit bubble (dark)
	var cockpit = PackedVector2Array([
		Vector2(-8, -7),
		Vector2(2, -7),
		Vector2(4, -2),
		Vector2(2, 3),
		Vector2(-8, 3),
		Vector2(-10, -2)
	])
	draw_colored_polygon(cockpit, Palette.HELI_COCKPIT)

	# Cockpit glass reflection
	draw_line(Vector2(-6, -6), Vector2(0, -4), Color(0.5, 0.7, 1.0, 0.4), 1.0)

	# Skids
	draw_line(Vector2(-8, 7), Vector2(8, 7), Palette.HELI_BODY, 2.0)
	draw_line(Vector2(-6, 6), Vector2(-6, 8), Palette.HELI_BODY, 1.5)
	draw_line(Vector2(4, 6), Vector2(4, 8), Palette.HELI_BODY, 1.5)

	# Tail rotor
	draw_circle(Vector2(18, -1), 4.0, Palette.HELI_BODY)
	draw_line(Vector2(18, -5), Vector2(18, 3), Palette.HELI_ROTOR, 1.5)

	# Main rotor (rotating)
	var rotor_len = 22.0
	var r1 = Vector2(cos(rotor_angle), sin(rotor_angle)) * rotor_len
	var r2 = Vector2(cos(rotor_angle + PI), sin(rotor_angle + PI)) * rotor_len
	draw_line(-r1, r1, Palette.HELI_ROTOR, 2.0)
	draw_line(-r2, r2, Palette.HELI_ROTOR, 2.0)
	# Rotor hub
	draw_circle(Vector2(0, -8), 3.0, Palette.HELI_BODY)

# ─── JET ────────────────────────────────────────────────────────────────────
func _draw_jet() -> void:
	# Delta wing shape (pointing up = forward)
	var wing = PackedVector2Array([
		Vector2(0, -16),      # nose
		Vector2(-18, 8),      # left wingtip
		Vector2(-8, 6),       # left inner
		Vector2(0, 10),       # tail center
		Vector2(8, 6),        # right inner
		Vector2(18, 8)        # right wingtip
	])
	draw_colored_polygon(wing, Palette.JET_WING)

	# Fuselage stripe
	var body = PackedVector2Array([
		Vector2(0, -16),
		Vector2(-4, 6),
		Vector2(0, 10),
		Vector2(4, 6)
	])
	draw_colored_polygon(body, Palette.JET_BODY)

	# Cockpit
	var cockpit = PackedVector2Array([
		Vector2(0, -12),
		Vector2(-3, -3),
		Vector2(3, -3)
	])
	draw_colored_polygon(cockpit, Color(0.2, 0.5, 0.9))

	# Engine exhausts (twin)
	var flicker = abs(sin(exhaust_anim)) * 0.5
	var glow = Palette.JET_ENGINE
	glow.a = 0.7 + flicker * 0.3
	draw_circle(Vector2(-4, 10), 3.5 + flicker, glow)
	draw_circle(Vector2(4, 10), 3.5 + flicker, glow)
	draw_circle(Vector2(-4, 10), 2.0, Color(1, 0.9, 0.3))
	draw_circle(Vector2(4, 10), 2.0, Color(1, 0.9, 0.3))

	# Wing highlights
	draw_line(Vector2(0, -16), Vector2(-18, 8), Color(1, 0.95, 0.5, 0.3), 1.0)
	draw_line(Vector2(0, -16), Vector2(18, 8), Color(1, 0.95, 0.5, 0.3), 1.0)
