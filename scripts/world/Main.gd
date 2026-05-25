extends Node2D
# Main — orchestrates all game objects.

const PlayerScript = preload("res://scripts/player/Player.gd")
const BulletScript = preload("res://scripts/player/Bullet.gd")
const EnemyScript = preload("res://scripts/enemies/Enemy.gd")
const RiverFieldScript = preload("res://scripts/world/RiverField.gd")
const SpawnerScript = preload("res://scripts/world/Spawner.gd")
const FuelDepotScript = preload("res://scripts/world/FuelDepot.gd")
const HUDScript = preload("res://scripts/ui/HUD.gd")

var river_field: Node2D
var spawner: Node
var players: Array = []
var hud: CanvasLayer

func _ready() -> void:
	GameState.reset()

	# Create river field (drawn first = behind everything)
	river_field = Node2D.new()
	river_field.set_script(RiverFieldScript)
	river_field.add_to_group("river")
	add_child(river_field)

	# Create spawner
	spawner = Node.new()
	spawner.set_script(SpawnerScript)
	add_child(spawner)
	spawner.setup(self, river_field)

	# Create players
	for i in GameSettings.player_count:
		var player = Node2D.new()
		player.set_script(PlayerScript)
		player.player_idx = i
		player.parent_ref = self
		player.add_to_group("players")
		add_child(player)
		players.append(player)

	# Create HUD (on top)
	hud = CanvasLayer.new()
	hud.set_script(HUDScript)
	add_child(hud)

	# Connect game over signal
	GameState.game_over.connect(_on_game_over)

func _process(delta: float) -> void:
	if not GameState.game_running:
		return

	# Update distance for active players
	for i in GameSettings.player_count:
		if GameState.active[i]:
			GameState.add_distance(i, GameSettings.get_scroll_speed() * delta)

	# Collision detection
	_check_collisions()

func _check_collisions() -> void:
	# Gather objects by group membership
	var bullets: Array = get_tree().get_nodes_in_group("bullets")
	var enemies: Array = get_tree().get_nodes_in_group("enemies")
	var depots: Array = get_tree().get_nodes_in_group("depots")
	var active_players: Array = get_tree().get_nodes_in_group("players")

	# Bullet vs enemy
	for bullet in bullets:
		if not is_instance_valid(bullet):
			continue
		for enemy in enemies:
			if not is_instance_valid(enemy):
				continue
			var dist = bullet.global_position.distance_to(enemy.global_position)
			if dist < enemy.get_collision_radius() + 6.0:
				GameState.add_score(bullet.player_idx, enemy.get_points())
				enemy.hit()
				bullet.queue_free()
				break

	# Player vs enemy / bank collision
	for player in active_players:
		if not is_instance_valid(player) or player.dead:
			continue
		var idx = player.player_idx

		# Check river bounds
		var bounds = river_field.get_bounds_at_y(player.global_position.y)
		if player.global_position.x < bounds.x + 10 or player.global_position.x > bounds.y - 10:
			player.take_hit()
			continue

		# Check enemy collisions
		for enemy in enemies:
			if not is_instance_valid(enemy):
				continue
			if player.global_position.distance_to(enemy.global_position) < enemy.get_collision_radius() + 12.0:
				player.take_hit()
				break

		# Check depot collisions
		for depot in depots:
			if not is_instance_valid(depot):
				continue
			depot.check_player_collision(player.global_position, idx)

func _on_game_over() -> void:
	await get_tree().create_timer(2.0).timeout
	get_tree().change_scene_to_file("res://scenes/GameOver.tscn")
