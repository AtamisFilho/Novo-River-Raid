extends Node
# Central color palette for River Raid clone

# ── Sky ──────────────────────────────────────────────────────────────────────
const SKY_TOP        = Color(0.04, 0.05, 0.15)   # deep navy
const SKY_MID        = Color(0.07, 0.10, 0.25)   # mid blue
const SKY_HORIZON    = Color(0.12, 0.18, 0.35)   # lighter horizon blue
const SKY_BAND       = Color(0.08, 0.12, 0.28, 0.3) # subtle banding stripe

# ── Terrain ───────────────────────────────────────────────────────────────────
const JUNGLE_FAR     = Color(0.05, 0.18, 0.05)   # very dark green far BG
const JUNGLE_MID     = Color(0.07, 0.25, 0.07)   # medium green mid layer
const JUNGLE_NEAR    = Color(0.10, 0.35, 0.10)   # brighter green near edge
const JUNGLE_EDGE    = Color(0.20, 0.60, 0.15)   # bright strip at water edge
const JUNGLE_SHADOW  = Color(0.03, 0.12, 0.03)   # shadow below edge strip
const TREE_DARK      = Color(0.04, 0.14, 0.04)   # dark pine silhouette
const TREE_MID       = Color(0.06, 0.20, 0.06)   # mid pine
const TREE_HIGHLIGHT = Color(0.12, 0.30, 0.08)   # slight highlight on trees

# ── River ─────────────────────────────────────────────────────────────────────
const RIVER_DEEP     = Color(0.05, 0.12, 0.35)   # deep center blue
const RIVER_MID      = Color(0.08, 0.18, 0.45)   # mid water
const RIVER_SHALLOW  = Color(0.12, 0.25, 0.50)   # lighter near edges
const RIVER_EDGE     = Color(0.18, 0.35, 0.55)   # very edge, near foam
const WAVE_COLOR     = Color(0.30, 0.65, 0.85, 0.35) # shimmer wave lines
const FOAM_COLOR     = Color(0.75, 0.88, 0.95, 0.70) # bank foam

# ── Player ────────────────────────────────────────────────────────────────────
const PLAYER_BODY    = Color(0.85, 0.92, 1.00)   # light blue-white fuselage
const PLAYER_WING    = Color(0.70, 0.80, 0.95)   # slightly darker wings
const PLAYER_COCKPIT = Color(0.40, 0.75, 1.00)   # bright blue cockpit
const PLAYER_ENGINE  = Color(0.30, 0.30, 0.35)   # dark engine nacelle
const EXHAUST_INNER  = Color(1.00, 0.90, 0.30)   # bright yellow flame core
const EXHAUST_OUTER  = Color(1.00, 0.45, 0.05)   # orange flame outer
const EXHAUST_TIP    = Color(0.80, 0.15, 0.00, 0.4) # reddish tip (fading)
const BULLET_CORE    = Color(1.00, 0.98, 0.40)   # bullet yellow core
const BULLET_GLOW    = Color(1.00, 0.75, 0.10, 0.45) # bullet glow halo

# ── Enemies ───────────────────────────────────────────────────────────────────
const BOAT_HULL      = Color(0.75, 0.10, 0.10)   # red boat hull
const BOAT_STRIPE    = Color(0.35, 0.05, 0.05)   # dark red stripe
const BOAT_WAKE      = Color(0.55, 0.72, 0.82, 0.55) # wake foam
const HELI_BODY      = Color(0.50, 0.52, 0.55)   # gray helicopter
const HELI_COCKPIT   = Color(0.20, 0.22, 0.28)   # dark cockpit
const HELI_ROTOR     = Color(0.65, 0.67, 0.70)   # rotor blade
const JET_WING       = Color(0.85, 0.75, 0.10)   # gold/yellow jet
const JET_BODY       = Color(0.95, 0.85, 0.20)   # brighter fuselage
const JET_ENGINE     = Color(1.00, 0.50, 0.05, 0.7) # engine glow

# ── Fuel Depot ────────────────────────────────────────────────────────────────
const DEPOT_PLATFORM = Color(0.20, 0.45, 0.20)   # green platform
const DEPOT_TOWER    = Color(0.90, 0.90, 0.90)   # white tower
const DEPOT_CROSS    = Color(0.85, 0.10, 0.10)   # red cross
const DEPOT_LIGHT_ON = Color(1.00, 0.20, 0.20)   # blinking red light on
const DEPOT_LIGHT_OFF= Color(0.45, 0.05, 0.05)   # blinking red light off
const DEPOT_TEXT     = Color(0.95, 0.80, 0.10)   # "F" letter yellow

# ── UI ────────────────────────────────────────────────────────────────────────
const HUD_BG         = Color(0.00, 0.00, 0.08, 0.72) # semi-transparent dark
const HUD_TEXT       = Color(0.95, 0.95, 0.80)   # warm white text
const HUD_SCORE      = Color(0.95, 0.90, 0.30)   # yellow score
const FUEL_HIGH      = Color(0.20, 0.85, 0.25)   # green fuel bar
const FUEL_MID       = Color(0.90, 0.80, 0.10)   # yellow fuel mid
const FUEL_LOW       = Color(0.90, 0.15, 0.10)   # red fuel low
const FUEL_BORDER    = Color(0.60, 0.60, 0.65)   # fuel bar border
const MENU_BG        = Color(0.03, 0.04, 0.12)   # deep dark menu bg
const MENU_TITLE     = Color(0.95, 0.80, 0.10)   # gold title
const MENU_BUTTON    = Color(0.12, 0.18, 0.35)   # button bg
const MENU_BUTTON_HV = Color(0.20, 0.30, 0.55)   # button hover
const MENU_BUTTON_TX = Color(0.90, 0.92, 1.00)   # button text
