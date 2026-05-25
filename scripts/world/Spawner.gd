extends Node
# Spawner — manages spawning of enemies and fuel depots over time.

var river_field: Node2D = null
var spawn_timer: float = 0.0
var depot_timer: float = 0.0
var base_spawn_interval: float = 2.5
var base_depot_interval: float = 15.0

# References to parent for adding children
var parent: Node2D = null

const EnemyScript = preload("res://scripts/enemies/Enemy.gd")
const FuelDepotScript = preload("res://scripts/world/FuelDepot.gd")

func setup(p_parent: Node2D, p_river: Node2D) -> void:
	parent = p_parent
	river_field = p_river

func _process(delta: float) -> void:
	if not GameState.game_running:
		return

	var density = GameSettings.enemy_density_mult
	var interval = base_spawn_interval / density

	spawn_timer += delta
	depot_timer += delta

	if spawn_timer >= interval:
		spawn_timer = 0.0
		_spawn_enemy()

	if depot_timer >= base_depot_interval:
		depot_timer = 0.0
		_spawn_depot()

func _spawn_enemy() -> void:
	if river_field == null or parent == null:
		return

	# Spawn near top of screen
	var spawn_y = 20.0
	var bounds = river_field.get_bounds_at_y(spawn_y)
	var river_w = bounds.y - bounds.x

	if river_w < 60:
		return

	var enemy = Node2D.new()
	enemy.set_script(EnemyScript)

	# Random type: 0=BOAT, 1=HELI, 2=JET
	var r = randf()
	if r < 0.45:
		enemy.enemy_type = 0   # BOAT
	elif r < 0.75:
		enemy.enemy_type = 1   # HELI
	else:
		enemy.enemy_type = 2   # JET

	# Random x within river
	var margin = 20.0
	var x = randf_range(bounds.x + margin, bounds.y - margin)
	enemy.position = Vector2(x, spawn_y)

	parent.add_child(enemy)

func _spawn_depot() -> void:
	if river_field == null or parent == null:
		return

	var spawn_y = 20.0
	var bounds = river_field.get_bounds_at_y(spawn_y)
	var cx = (bounds.x + bounds.y) * 0.5

	var depot = Node2D.new()
	depot.set_script(FuelDepotScript)
	depot.position = Vector2(cx, spawn_y)
	parent.add_child(depot)
