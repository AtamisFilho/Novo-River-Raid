extends Node
# Boot script — immediately transitions to the main menu

func _ready() -> void:
	get_tree().change_scene_to_file("res://scenes/MainMenu.tscn")
