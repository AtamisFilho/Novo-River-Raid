extends Node2D
# Bullet — bright yellow elongated oval with glow. Moves upward.

const SPEED: float = 500.0
var player_idx: int = 0

func _ready() -> void:
	add_to_group("bullets")

func _process(delta: float) -> void:
	position.y -= SPEED * delta
	queue_redraw()

	# Destroy if off screen
	if position.y < -20:
		queue_free()

func _draw() -> void:
	# Outer glow (large soft oval)
	draw_circle(Vector2.ZERO, 7.0, Palette.BULLET_GLOW)

	# Inner bright core (elongated)
	var points = PackedVector2Array([
		Vector2(0, -8),
		Vector2(-3, -3),
		Vector2(-3, 3),
		Vector2(0, 8),
		Vector2(3, 3),
		Vector2(3, -3)
	])
	draw_colored_polygon(points, Palette.BULLET_CORE)

	# Bright center dot
	draw_circle(Vector2.ZERO, 2.5, Color(1.0, 1.0, 0.9))
