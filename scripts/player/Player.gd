extends Node2D
# Player — beautiful delta-wing jet with engine exhaust, banking animation.

var player_idx: int = 0
var speed: float = 160.0
var shoot_cooldown: float = 0.0
const SHOOT_INTERVAL: float = 0.25
const FUEL_DRAIN_RATE: float = 4.0  # units per second base

var invincible: bool = false
var invincible_timer: float = 0.0
const INVINCIBLE_DURATION: float = 2.5

var bank_angle: float = 0.0       # current banking angle (visual only)
var exhaust_anim: float = 0.0
var dead: bool = false

# Reference to parent for spawning bullets
var parent_ref: Node = null

const BulletScript = preload("res://scripts/player/Bullet.gd")

# Input action names
func _get_left_action() -> String: return "p%d_left" % (player_idx + 1)
func _get_right_action() -> String: return "p%d_right" % (player_idx + 1)
func _get_up_action() -> String: return "p%d_up" % (player_idx + 1)
func _get_down_action() -> String: return "p%d_down" % (player_idx + 1)
func _get_fire_action() -> String: return "p%d_fire" % (player_idx + 1)

func _ready() -> void:
	# Default spawn position (center-bottom area of screen)
	if player_idx == 0:
		position = Vector2(240, 600)
	else:
		position = Vector2(280, 600)

func _process(delta: float) -> void:
	if dead:
		return

	exhaust_anim += delta * 6.0
	shoot_cooldown -= delta

	# Fuel drain
	GameState.drain_fuel(player_idx, FUEL_DRAIN_RATE * GameSettings.fuel_consumption_mult * delta)

	if invincible:
		invincible_timer -= delta
		if invincible_timer <= 0:
			invincible = false

	_handle_movement(delta)
	_handle_shooting()
	queue_redraw()

func _handle_movement(delta: float) -> void:
	var dx: float = 0.0
	var dy: float = 0.0

	if Input.is_action_pressed(_get_left_action()):
		dx -= speed * delta
	if Input.is_action_pressed(_get_right_action()):
		dx += speed * delta
	if Input.is_action_pressed(_get_up_action()):
		dy -= speed * delta * 0.7
	if Input.is_action_pressed(_get_down_action()):
		dy += speed * delta * 0.5

	position.x += dx
	position.y += dy

	# Clamp to screen
	position.x = clamp(position.x, 20, 460)
	position.y = clamp(position.y, 80, 700)

	# Banking animation
	var target_bank = dx * 1.8  # degrees proportional to lateral movement
	bank_angle = lerp(bank_angle, target_bank, 0.15)

func _handle_shooting() -> void:
	if Input.is_action_pressed(_get_fire_action()) and shoot_cooldown <= 0:
		shoot_cooldown = SHOOT_INTERVAL
		_spawn_bullet()

func _spawn_bullet() -> void:
	if parent_ref == null:
		return
	var bullet = Node2D.new()
	bullet.set_script(BulletScript)
	bullet.player_idx = player_idx
	bullet.position = position + Vector2(0, -20)
	parent_ref.add_child(bullet)

func take_hit() -> void:
	if invincible or dead:
		return
	GameState.kill_player(player_idx)
	if GameState.lives[player_idx] <= 0:
		dead = true
		queue_free()
		return
	invincible = true
	invincible_timer = INVINCIBLE_DURATION

func _draw() -> void:
	# Blink when invincible
	if invincible and fmod(invincible_timer * 8.0, 2.0) < 1.0:
		return

	# Apply banking rotation around local origin
	var bank_rad = deg_to_rad(bank_angle)

	# Draw jet with banking
	draw_set_transform(Vector2.ZERO, bank_rad, Vector2.ONE)
	_draw_jet()
	draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)

func _draw_jet() -> void:
	# === MAIN DELTA WING ===
	# Large swept-back wings
	var wing_l = PackedVector2Array([
		Vector2(0, -20),      # nose tip
		Vector2(-22, 12),     # left wingtip
		Vector2(-14, 8),      # left mid
		Vector2(-6, 14),      # left tail
		Vector2(0, 12)        # tail center
	])
	var wing_r = PackedVector2Array([
		Vector2(0, -20),      # nose tip
		Vector2(22, 12),      # right wingtip
		Vector2(14, 8),       # right mid
		Vector2(6, 14),       # right tail
		Vector2(0, 12)        # tail center
	])
	draw_colored_polygon(wing_l, Palette.PLAYER_WING)
	draw_colored_polygon(wing_r, Palette.PLAYER_WING)

	# Fuselage (lighter center stripe)
	var fuselage = PackedVector2Array([
		Vector2(0, -20),
		Vector2(-5, 5),
		Vector2(-3, 14),
		Vector2(0, 12),
		Vector2(3, 14),
		Vector2(5, 5)
	])
	draw_colored_polygon(fuselage, Palette.PLAYER_BODY)

	# Cockpit canopy
	var canopy = PackedVector2Array([
		Vector2(0, -16),
		Vector2(-4, -6),
		Vector2(-3, 0),
		Vector2(3, 0),
		Vector2(4, -6)
	])
	draw_colored_polygon(canopy, Palette.PLAYER_COCKPIT)

	# Canopy glass highlight
	draw_line(Vector2(-2, -14), Vector2(-1, -5), Color(1, 1, 1, 0.4), 1.0)

	# Wing highlights (leading edge)
	draw_line(Vector2(0, -20), Vector2(-22, 12), Color(1, 1, 1, 0.25), 1.0)
	draw_line(Vector2(0, -20), Vector2(22, 12), Color(1, 1, 1, 0.25), 1.0)

	# Engine nacelles
	draw_rect(Rect2(-9, 6, 5, 9), Palette.PLAYER_ENGINE)
	draw_rect(Rect2(4, 6, 5, 9), Palette.PLAYER_ENGINE)

	# Exhaust flames (flickering)
	var flicker = 0.5 + 0.5 * abs(sin(exhaust_anim))
	var flame_len = 8.0 + flicker * 6.0

	# Left exhaust
	_draw_flame(Vector2(-6.5, 15), flame_len)
	# Right exhaust
	_draw_flame(Vector2(6.5, 15), flame_len)

func _draw_flame(base: Vector2, length: float) -> void:
	# Outer orange glow
	var outer = PackedVector2Array([
		base + Vector2(-3, 0),
		base + Vector2(3, 0),
		base + Vector2(1, length)
	])
	draw_colored_polygon(outer, Palette.EXHAUST_OUTER)

	# Inner yellow core
	var inner = PackedVector2Array([
		base + Vector2(-1.5, 0),
		base + Vector2(1.5, 0),
		base + Vector2(0, length * 0.6)
	])
	draw_colored_polygon(inner, Palette.EXHAUST_INNER)

	# Tip glow
	var tip_c = Palette.EXHAUST_TIP
	draw_circle(base + Vector2(0, length * 0.5), 3.0, tip_c)
