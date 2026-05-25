extends Node2D
# RiverField — the heart of the game. Draws all terrain, water, sky procedurally.

const SEG_H: int = 24          # pixels per segment
const MIN_WIDTH: float = 130.0
const MAX_WIDTH: float = 220.0
const CENTER_DRIFT: float = 8.0  # max px drift per segment
const VIEWPORT_W: float = 480.0
const VIEWPORT_H: float = 720.0

# How many segments we keep in memory (enough to fill screen + buffer)
const SEG_COUNT: int = 40

# Tree data: Array of {x, seg_index, size, side} — generated once, recycled
const TREE_COUNT: int = 30

var segments: Array = []       # Array of {left, right, y_world}
var scroll_y: float = 0.0      # how many world-pixels have scrolled past
var scroll_speed: float = 120.0

# Wave animation
var wave_offset: float = 0.0
var wave_speed: float = 40.0

# Tree data
var trees: Array = []
var rng: RandomNumberGenerator = RandomNumberGenerator.new()

# Foam fleck data
var foam_flecks: Array = []
const FOAM_COUNT: int = 50

func _ready() -> void:
	rng.seed = 42
	_generate_initial_segments()
	_generate_trees()
	_generate_foam()

func _generate_initial_segments() -> void:
	segments.clear()
	var cx: float = VIEWPORT_W * 0.5
	var w: float = 160.0
	for i in SEG_COUNT:
		var y_world = -float(SEG_COUNT - i) * SEG_H
		var left = cx - w * 0.5
		var right = cx + w * 0.5
		segments.append({"left": left, "right": right, "y_world": y_world})
		# Drift for next
		cx += rng.randf_range(-CENTER_DRIFT, CENTER_DRIFT)
		cx = clamp(cx, MIN_WIDTH * 0.5 + 10, VIEWPORT_W - MIN_WIDTH * 0.5 - 10)
		w += rng.randf_range(-6.0, 6.0)
		w = clamp(w, MIN_WIDTH, MAX_WIDTH)

func _generate_trees() -> void:
	trees.clear()
	for i in TREE_COUNT:
		var side = 0 if rng.randf() < 0.5 else 1
		# x offset from the bank edge (into terrain)
		var x_off = rng.randf_range(5.0, 50.0)
		var seg_idx = rng.randi_range(0, SEG_COUNT - 1)
		var size = rng.randf_range(12.0, 22.0)
		trees.append({
			"side": side,
			"x_off": x_off,
			"seg_idx": seg_idx,
			"size": size,
			"variation": rng.randf()
		})

func _generate_foam() -> void:
	foam_flecks.clear()
	for i in FOAM_COUNT:
		foam_flecks.append({
			"t": rng.randf(),       # 0..1 along river edge
			"offset": rng.randf_range(-3.0, 3.0),
			"side": 0 if rng.randf() < 0.5 else 1,
			"size": rng.randf_range(1.5, 3.5),
			"phase": rng.randf() * TAU
		})

func _process(delta: float) -> void:
	scroll_speed = GameSettings.get_scroll_speed()
	scroll_y += scroll_speed * delta
	wave_offset += wave_speed * delta

	# Recycle segments that have scrolled off the bottom
	_recycle_segments()
	queue_redraw()

func _recycle_segments() -> void:
	# segments[0] is oldest (highest y_world = scrolled past bottom)
	# screen_y = y_world - scroll_y + VIEWPORT_H  (approx)
	while segments.size() > 0:
		var seg = segments[0]
		var screen_y = seg.y_world - scroll_y + VIEWPORT_H
		if screen_y > VIEWPORT_H + SEG_H * 2:
			segments.pop_front()
			_append_new_segment()
		else:
			break

func _append_new_segment() -> void:
	var last = segments[-1]
	var cx = (last.left + last.right) * 0.5
	var w = last.right - last.left
	cx += rng.randf_range(-CENTER_DRIFT, CENTER_DRIFT)
	cx = clamp(cx, MIN_WIDTH * 0.5 + 10, VIEWPORT_W - MIN_WIDTH * 0.5 - 10)
	w += rng.randf_range(-6.0, 6.0)
	w = clamp(w, MIN_WIDTH, MAX_WIDTH)
	segments.append({
		"left": cx - w * 0.5,
		"right": cx + w * 0.5,
		"y_world": last.y_world + SEG_H
	})

# Returns (left_x, right_x) river bounds at a given screen_y
func get_bounds_at_y(screen_y: float) -> Vector2:
	var world_y = screen_y + scroll_y - VIEWPORT_H
	# Find the segment that contains this world_y
	for i in range(segments.size() - 1):
		var s0 = segments[i]
		var s1 = segments[i + 1]
		if world_y >= s0.y_world and world_y < s1.y_world:
			var t = (world_y - s0.y_world) / float(SEG_H)
			t = clamp(t, 0.0, 1.0)
			var left = lerp(s0.left, s1.left, t)
			var right = lerp(s0.right, s1.right, t)
			return Vector2(left, right)
	# Fallback
	if segments.size() > 0:
		var last = segments[-1]
		return Vector2(last.left, last.right)
	return Vector2(120.0, 360.0)

func _seg_screen_y(seg: Dictionary) -> float:
	return seg.y_world - scroll_y + VIEWPORT_H

func _draw() -> void:
	_draw_sky()
	_draw_terrain_far()
	_draw_terrain_mid()
	_draw_terrain_near_edge()
	_draw_tree_silhouettes()
	_draw_river_water()
	_draw_wave_lines()
	_draw_bank_foam()

# ─── SKY ────────────────────────────────────────────────────────────────────

func _draw_sky() -> void:
	var rect = Rect2(0, 0, VIEWPORT_W, VIEWPORT_H)
	# Draw gradient sky using horizontal strips
	var strips = 32
	for i in strips:
		var t = float(i) / float(strips)
		var y = t * VIEWPORT_H
		var c = Palette.SKY_TOP.lerp(Palette.SKY_HORIZON, t)
		draw_rect(Rect2(0, y, VIEWPORT_W, VIEWPORT_H / strips + 1), c)

	# Subtle horizontal banding
	for i in range(0, int(VIEWPORT_H), 60):
		var band_y = float(i) + fmod(scroll_y * 0.05, 60.0)
		draw_rect(Rect2(0, band_y, VIEWPORT_W, 2), Palette.SKY_BAND)

# ─── TERRAIN ────────────────────────────────────────────────────────────────

func _draw_terrain_far() -> void:
	# Collect river-edge points for left and right sides
	var river_left: Array = []
	var river_right: Array = []

	for seg in segments:
		var sy = _seg_screen_y(seg)
		if sy < -SEG_H * 2 or sy > VIEWPORT_H + SEG_H * 2:
			continue
		river_left.append(Vector2(seg.left, sy))
		river_right.append(Vector2(seg.right, sy))

	if river_left.size() < 2:
		return

	# Left terrain polygon: screen-left edge going down, then river-left edge going back up
	var left_poly = PackedVector2Array()
	left_poly.append(Vector2(0, -10))
	left_poly.append(Vector2(river_left[0].x, -10))
	for pt in river_left:
		left_poly.append(pt)
	left_poly.append(Vector2(river_left[-1].x, VIEWPORT_H + 10))
	left_poly.append(Vector2(0, VIEWPORT_H + 10))
	draw_colored_polygon(left_poly, Palette.JUNGLE_FAR)

	# Right terrain polygon: river-right edge going down, then screen-right edge going back up
	var right_poly = PackedVector2Array()
	right_poly.append(Vector2(river_right[0].x, -10))
	right_poly.append(Vector2(VIEWPORT_W, -10))
	right_poly.append(Vector2(VIEWPORT_W, VIEWPORT_H + 10))
	right_poly.append(Vector2(river_right[-1].x, VIEWPORT_H + 10))
	for i in range(river_right.size() - 1, -1, -1):
		right_poly.append(river_right[i])
	draw_colored_polygon(right_poly, Palette.JUNGLE_FAR)

func _draw_terrain_mid() -> void:
	# Slightly inset from river edge — creates layered depth
	const INSET: float = 0.0
	const LAYER_W: float = 35.0

	if segments.size() < 2:
		return

	# Collect edge points
	var mid_left: Array = []
	var mid_right: Array = []
	for seg in segments:
		var sy = _seg_screen_y(seg)
		if sy < -SEG_H * 2 or sy > VIEWPORT_H + SEG_H * 2:
			continue
		mid_left.append(Vector2(seg.left + LAYER_W, sy))
		mid_right.append(Vector2(seg.right - LAYER_W, sy))

	if mid_left.size() < 2:
		return

	# Left mid poly (same pattern as far terrain)
	var left_poly = PackedVector2Array()
	left_poly.append(Vector2(0, -10))
	left_poly.append(Vector2(mid_left[0].x, -10))
	for pt in mid_left:
		left_poly.append(pt)
	left_poly.append(Vector2(mid_left[-1].x, VIEWPORT_H + 10))
	left_poly.append(Vector2(0, VIEWPORT_H + 10))
	draw_colored_polygon(left_poly, Palette.JUNGLE_MID)

	var right_poly = PackedVector2Array()
	right_poly.append(Vector2(mid_right[0].x, -10))
	right_poly.append(Vector2(VIEWPORT_W, -10))
	right_poly.append(Vector2(VIEWPORT_W, VIEWPORT_H + 10))
	right_poly.append(Vector2(mid_right[-1].x, VIEWPORT_H + 10))
	for i in range(mid_right.size() - 1, -1, -1):
		right_poly.append(mid_right[i])
	draw_colored_polygon(right_poly, Palette.JUNGLE_MID)

func _draw_terrain_near_edge() -> void:
	# 8px bright green strip right at river edge + shadow
	if segments.size() < 2:
		return

	for i in range(segments.size() - 1):
		var s0 = segments[i]
		var s1 = segments[i + 1]
		var y0 = _seg_screen_y(s0)
		var y1 = _seg_screen_y(s1)

		if y1 < -SEG_H or y0 > VIEWPORT_H + SEG_H:
			continue

		# Left edge bright strip
		var lp = PackedVector2Array([
			Vector2(s0.left, y0),
			Vector2(s0.left + 8, y0),
			Vector2(s1.left + 8, y1),
			Vector2(s1.left, y1)
		])
		draw_colored_polygon(lp, Palette.JUNGLE_EDGE)

		# Left shadow strip inside water edge
		var ls = PackedVector2Array([
			Vector2(s0.left + 8, y0),
			Vector2(s0.left + 14, y0),
			Vector2(s1.left + 14, y1),
			Vector2(s1.left + 8, y1)
		])
		draw_colored_polygon(ls, Palette.JUNGLE_SHADOW)

		# Right edge bright strip
		var rp = PackedVector2Array([
			Vector2(s0.right - 8, y0),
			Vector2(s0.right, y0),
			Vector2(s1.right, y1),
			Vector2(s1.right - 8, y1)
		])
		draw_colored_polygon(rp, Palette.JUNGLE_EDGE)

		# Right shadow
		var rs = PackedVector2Array([
			Vector2(s0.right - 14, y0),
			Vector2(s0.right - 8, y0),
			Vector2(s1.right - 8, y1),
			Vector2(s1.right - 14, y1)
		])
		draw_colored_polygon(rs, Palette.JUNGLE_SHADOW)

# ─── TREE SILHOUETTES ───────────────────────────────────────────────────────

func _draw_tree_silhouettes() -> void:
	for tree in trees:
		var idx = tree.seg_idx % segments.size()
		if idx < 0 or idx >= segments.size():
			continue
		var seg = segments[idx]
		var sy = _seg_screen_y(seg)
		# Parallax: trees scroll at 0.3x speed (they're far away)
		# We fake this by using a parallax offset
		var parallax_sy = sy  # already handled by segment position

		var tx: float
		if tree.side == 0:
			tx = seg.left - tree.x_off
		else:
			tx = seg.right + tree.x_off

		_draw_pine_tree(Vector2(tx, parallax_sy), tree.size, tree.variation)

func _draw_pine_tree(pos: Vector2, size: float, variation: float) -> void:
	# Pine tree: 3 stacked triangles, darker at bottom
	var layers = 3
	for l in layers:
		var t = float(l) / float(layers)
		var layer_w = size * (1.0 - t * 0.3)
		var layer_h = size * 0.5
		var y_off = -float(l) * (size * 0.35)
		var pts = PackedVector2Array([
			Vector2(pos.x, pos.y + y_off - layer_h),
			Vector2(pos.x - layer_w * 0.5, pos.y + y_off),
			Vector2(pos.x + layer_w * 0.5, pos.y + y_off)
		])
		var c = Palette.TREE_DARK.lerp(Palette.TREE_MID, t * 0.5 + variation * 0.3)
		draw_colored_polygon(pts, c)

	# Trunk
	draw_rect(Rect2(pos.x - 2, pos.y, 4, size * 0.3), Palette.TREE_DARK)

# ─── RIVER WATER ────────────────────────────────────────────────────────────

func _draw_river_water() -> void:
	if segments.size() < 2:
		return

	# Draw river as 4 vertical gradient strips
	# Build center line and left/right bounds
	var n = segments.size()
	var left_edge: Array = []
	var right_edge: Array = []

	for seg in segments:
		var sy = _seg_screen_y(seg)
		left_edge.append(Vector2(seg.left + 14, sy))
		right_edge.append(Vector2(seg.right - 14, sy))

	# Draw 4 horizontal color bands from center outward
	# Center strip (deep blue)
	var center_l: Array = []
	var center_r: Array = []
	var mid_l: Array = []
	var mid_r: Array = []

	for i in n:
		var cx = (left_edge[i].x + right_edge[i].x) * 0.5
		var hw = (right_edge[i].x - left_edge[i].x) * 0.5
		var sy = left_edge[i].y
		center_l.append(Vector2(cx - hw * 0.25, sy))
		center_r.append(Vector2(cx + hw * 0.25, sy))
		mid_l.append(Vector2(cx - hw * 0.65, sy))
		mid_r.append(Vector2(cx + hw * 0.65, sy))

	# Full river fill (shallow color as base)
	_fill_river_strip(left_edge, right_edge, Palette.RIVER_SHALLOW)
	# Mid band
	_fill_river_strip(mid_l, mid_r, Palette.RIVER_MID)
	# Deep center
	_fill_river_strip(center_l, center_r, Palette.RIVER_DEEP)

func _fill_river_strip(left_pts: Array, right_pts: Array, color: Color) -> void:
	if left_pts.size() < 2:
		return
	var n = left_pts.size()
	var poly = PackedVector2Array()
	for pt in left_pts:
		poly.append(pt)
	for i in range(n - 1, -1, -1):
		poly.append(right_pts[i])
	if poly.size() >= 3:
		draw_colored_polygon(poly, color)

# ─── WAVE LINES ─────────────────────────────────────────────────────────────

func _draw_wave_lines() -> void:
	# Horizontal dashes that animate downward
	var wave_spacing: float = 30.0
	var dash_len: float = 18.0
	var gap_len: float = 10.0

	var y = fmod(wave_offset, wave_spacing)
	while y < VIEWPORT_H:
		var bounds = get_bounds_at_y(y)
		var lx = bounds.x + 16
		var rx = bounds.y - 16
		if rx - lx < 30:
			y += wave_spacing
			continue

		# Draw dashes across river width
		var cx_offset = sin(y * 0.05 + wave_offset * 0.03) * 15.0
		var x = lx
		var toggle = true
		while x < rx:
			if toggle:
				var x2 = min(x + dash_len, rx)
				var alpha = 0.15 + 0.2 * abs(sin(y * 0.08 + wave_offset * 0.02))
				var c = Palette.WAVE_COLOR
				c.a = alpha
				draw_line(Vector2(x + cx_offset, y), Vector2(x2 + cx_offset, y), c, 1.0)
			x += toggle ? dash_len : gap_len
			toggle = !toggle

		y += wave_spacing

# ─── BANK FOAM ──────────────────────────────────────────────────────────────

func _draw_bank_foam() -> void:
	for fleck in foam_flecks:
		# Map t (0..1) to a screen_y position
		var screen_y = fmod(fleck.t * VIEWPORT_H + scroll_y * 0.8, VIEWPORT_H)
		var bounds = get_bounds_at_y(screen_y)
		var x: float
		if fleck.side == 0:
			x = bounds.x + 12 + fleck.offset
		else:
			x = bounds.y - 12 + fleck.offset

		# Foam fleck: small white dot, pulsing alpha
		var alpha = 0.4 + 0.3 * sin(scroll_y * 0.05 + fleck.phase)
		var c = Palette.FOAM_COLOR
		c.a = alpha
		draw_circle(Vector2(x, screen_y), fleck.size, c)
