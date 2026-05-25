# Documentação Técnica — Novo River Raid

Este documento explica **como o jogo é arquitetado** e **como estendê-lo**. A ideia é que qualquer alteração futura (sua ou minha) seja simples e localizada.

---

## 1. Filosofia de design

O projeto segue duas decisões centrais:

1. **Lógica em scripts, cenas enxutas.** Cada `.tscn` contém apenas o nó raiz com o script anexado. Os filhos (colisores, sprites, etc.) são criados em código no `_ready()`. Isso torna o projeto robusto a edições manuais, fácil de versionar em Git (são todos arquivos de texto pequenos) e elimina a fragilidade de IDs internos de cena.

2. **Estado global desacoplado via Autoloads + sinais.** Três singletons concentram o estado, e os nós conversam por *signals*, não por referências diretas. Trocar uma peça (ex.: a HUD) não quebra as outras.

---

## 2. Os três Autoloads (singletons)

Definidos em `project.godot`, sempre disponíveis globalmente.

### `GameSettings` (`scripts/globals/GameSettings.gd`)
Tudo que o jogador configura **e que persiste entre sessões**:
- **Dificuldade**: presets (Fácil/Normal/Difícil) ou `CUSTOM`. Cada preset preenche quatro multiplicadores — `scroll_speed_mult`, `enemy_density_mult`, `fuel_consumption_mult`, `enemy_speed_mult` — que o resto do jogo lê.
- **Número de jogadores** (1 ou 2).
- **Remapeamento de teclas** via `remap_key(action, keycode)`, preservando os binds de joystick.
- Persistência automática em `user://settings.cfg` (`save_settings` / `load_settings`).

> Para adicionar uma nova configuração: crie a variável, salve/carregue em `save_settings`/`load_settings`, e leia onde precisar.

### `GameState` (`scripts/globals/GameState.gd`)
Estado da **partida atual** (não persiste): pontuação, vidas, combustível e distância, **por jogador** (arrays indexados em 0 e 1). Emite sinais (`score_changed`, `fuel_changed`, `lives_changed`, `game_over`, etc.) que a HUD e o `Main` escutam. A regra de co-op está aqui: o jogo só termina quando **ambos** os jogadores ficam sem vidas.

### `Palette` (`scripts/globals/Palette.gd`)
Paleta de cores única do jogo. Centralizar aqui permite, no futuro, trocar o tema visual inteiro (recurso de "skins/temas" do roadmap) mudando um só arquivo.

---

## 3. Fluxo de cenas

```
Boot  →  MainMenu  →  Main (jogo)  →  GameOver  →  MainMenu
                ↘  SettingsMenu  ↗
```

- **Boot**: ponto único de entrada; encaminha ao menu.
- **MainMenu**: escolhe solo/co-op, abre configurações, sai.
- **SettingsMenu**: dificuldade + remapeamento de controles (em tempo real, salvando na hora).
- **Main**: monta a partida (ver abaixo).
- **GameOver**: mostra pontuações e volta ao menu.

---

## 4. A cena de jogo (`Main`)

`scripts/world/Main.gd` é o **orquestrador**. No `_ready()` ele:
1. Chama `GameState.start_new_game(player_count)`.
2. Instancia o **rio** (`RiverField`).
3. Cria containers para **inimigos** e **tiros**.
4. Instancia 1 ou 2 **naves** (`Player`), injetando o índice do jogador e a referência ao rio, e conecta o sinal `request_bullet`.
5. Instancia o **Spawner** e a **HUD**.
6. Conecta `game_over`.

O `Main` é marcado como `PROCESS_MODE_ALWAYS` para conseguir despausar mesmo com a árvore pausada.

### Por que a nave emite um sinal para atirar, em vez de criar a bala?
Para desacoplar: a nave não precisa saber onde as balas vivem na árvore. Ela grita "quero uma bala aqui"; o `Main` decide onde instanciá-la. Isso facilita, por exemplo, reaproveitar a nave em outra cena.

---

## 5. O rio procedural (`RiverField`)

`scripts/world/RiverField.gd`. O rio é uma lista de **fatias horizontais** (`_segments`), cada uma sabendo onde começam as margens esquerda e direita. A cada quadro:
- A rolagem (`_scroll_offset`) avança conforme `base_scroll_speed × scroll_speed_mult`.
- Quando avança uma fatia inteira, a de baixo é descartada e uma nova é **gerada no topo** (meandro suave + largura oscilante), reciclando a lista.

A função-chave para colisão é **`get_bounds_at_y(screen_y)`**, que devolve `(left_x, right_x)` da água navegável naquela altura. A nave usa isso para detectar batida na margem.

> Para mudar o "sabor" do rio (mais sinuoso, mais estreito, ilhas), mexa em `_make_segment()` e nas constantes `MIN/MAX_RIVER_W`.

---

## 6. A nave (`Player`) — um script, dois jogadores

`scripts/player/Player.gd`. O segredo do co-op: o **mesmo script** serve a P1 e P2. Ao definir `player_index` (0 ou 1), ele monta os nomes das ações de input (`p1_*` ou `p2_*`) e lê só as suas. Como `Input.get_action_strength` já agrega teclado **e** joystick, um jogador pode usar controle e o outro teclado sem nenhuma lógica extra.

Responsabilidades: movimento, tiro (com cooldown), consumo de combustível, colisão com margem (via `get_bounds_at_y`) e com inimigos/tanques (via `area_entered`), morte e renascimento com piscar.

---

## 7. Inimigos, tanques e spawner

- **`Enemy`** (`scripts/enemies/Enemy.gd`): um script para três tipos (`BOAT`, `HELI`, `JET`) que diferem em cor, pontos e movimento. A velocidade escala com `enemy_speed_mult`. Recebe tiro via `hit(shooter_idx)`, creditando os pontos ao atirador certo (importante no co-op).
- **`FuelDepot`** (`scripts/world/FuelDepot.gd`): tanque coletável; ao ser tocado, reabastece e dá pontos.
- **`Spawner`** (`scripts/world/Spawner.gd`): gera inimigos e tanques no topo, **dentro das margens atuais** do rio. A frequência escala com `enemy_density_mult`.

> Para um novo tipo de inimigo: adicione um valor ao `enum Kind`, trate-o no `_ready`, `_physics_process` e `_draw` do `Enemy`, e inclua no sorteio do `Spawner`.

---

## 8. HUD

`scripts/ui/HUD.gd` é um `CanvasLayer` construído em código que escuta os sinais de `GameState` e se adapta a 1 ou 2 jogadores. As barras de combustível são desenhadas manualmente (`_draw_bars`), mudando de verde para vermelho conforme esvaziam.

---

## 9. Input Map (em `project.godot`)

As ações seguem o padrão `p{N}_{ação}` e **cada uma já tem evento de teclado e de joystick**. Os binds de joystick usam `joy_device: 0` para P1 e `joy_device: 1` para P2, então dois controles físicos são automaticamente separados entre os jogadores. O `SettingsMenu` reescreve apenas os eventos de teclado, preservando os de joystick.

---

## 10. Como adicionar coisas comuns (receitas rápidas)

| Quero... | Onde mexer |
|----------|-----------|
| Novo tipo de inimigo | `Enemy.gd` (enum + 3 métodos) e `Spawner.gd` (sorteio) |
| Power-up | Novo `Area2D` no grupo próprio + tratar em `Player._on_area_entered` |
| Nova configuração persistente | `GameSettings.gd` (variável + save/load) |
| Mudar cores/tema | `Palette.gd` |
| Mudar regra de combustível/pontos | `GameState.gd` e `Player.gd` |
| Tela de pausa visual | Criar `Pause.tscn`/`.gd` e exibir em `Main._toggle_pause` |
| Controles de toque (Android) | Adicionar botões `TouchScreenButton` chamando as mesmas ações `p1_*` |

---

## 11. Notas de portabilidade (Android/Web)

A base já está pronta porque:
- `window/stretch/mode = "canvas_items"` + `aspect = "keep"` adaptam a tela a qualquer resolução.
- `emulate_touch_from_mouse` está ligado e o `InputMap` é baseado em **ações**, então acrescentar toque é só ligar botões de tela às ações existentes.
- O renderer está em `gl_compatibility`, o mais compatível com web e dispositivos móveis.

Quando chegarmos à Fase 4, exportar é questão de configurar os presets de Android e Web no editor.
