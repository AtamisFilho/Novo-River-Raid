# Documentação Técnica — Novo River Raid (Web App)

Este documento explica **como o jogo é arquitetado** e **como estendê-lo**. A ideia é que qualquer alteração futura seja simples e localizada.

---

## 1. Filosofia de design

O projeto segue duas decisões centrais, mantidas desde a versão Godot:

1. **Lógica em módulos, renderização via Canvas.** Cada classe JavaScript contém sua lógica de atualização (`update(delta)`) e renderização (`draw(ctx)`). Não há frameworks, DOM manipulation para o jogo, ou dependências externas — apenas Canvas 2D puro. Isso torna o projeto leve, rápido e fácil de versionar.

2. **Estado global desacoplado via singletons + eventos.** Dois módulos concentram o estado, e os objetos se comunicam por eventos customizados, não por referências diretas. Trocar uma peça (ex.: a HUD) não quebra as outras.

---

## 2. Os dois singletons (módulos globais)

### `GameSettings` (`js/game-settings.js`)
Tudo que o jogador configura **e que persiste entre sessões**:
- **Dificuldade**: presets (Fácil/Normal/Difícil) ou `CUSTOM`. Cada preset preenche quatro multiplicadores — `scrollSpeedMult`, `enemyDensityMult`, `fuelConsumptionMult`, `enemySpeedMult` — que o resto do jogo lê.
- **Número de jogadores** (1 ou 2).
- Persistência automática via `localStorage` (`saveSettings` / `loadSettings`).

> Para adicionar uma nova configuração: crie a variável, salve/carregue em `saveSettings`/`loadSettings`, e leia onde precisar.

### `GameState` (`js/game-state.js`)
Estado da **partida atual** (não persiste): pontuação, vidas, combustível e distância, **por jogador** (arrays indexados em 0 e 1). Emite eventos (`scoreChanged`, `fuelChanged`, `livesChanged`, `gameOver`) que a HUD e o `MainGame` escutam. A regra de co-op está aqui: o jogo só termina quando **ambos** os jogadores ficam sem vidas.

---

## 3. Paleta de cores (`js/palette.js`)

Centraliza todas as cores do jogo. Cada cor é um array `[r, g, b]` ou `[r, g, b, a]` com valores 0-1. As funções auxiliares `rgba()` e `lerpColor()` convertem para strings CSS. Trocar o tema visual inteiro é questão de alterar este arquivo.

---

## 4. Fluxo de cenas

```
MainMenu  →  MainGame (jogo)  →  GameOver  →  MainMenu
     ↘  SettingsMenu  ↗
```

- **MainMenu**: escolhe solo/co-op, abre configurações.
- **SettingsMenu**: dificuldade + número de jogadores (salvando na hora).
- **MainGame**: monta e executa a partida (ver abaixo).
- **GameOver**: mostra pontuações e volta ao menu.

O `App` (`js/app.js`) é o orquestrador que gerencia o loop principal e troca de cenas.

---

## 5. A cena de jogo (`MainGame`)

`js/main.js` é o **orquestrador da partida**. No construtor ele:
1. Instancia o **rio** (`RiverField`).
2. Cria o **spawner** (`Spawner`).
3. Instancia 1 ou 2 **naves** (`Player`), conectando o callback `onRequestBullet`.
4. Cria a **HUD**.
5. Conecta o evento `gameOver`.

### Por que a nave usa callback para atirar, em vez de criar a bala?
Para desacoplar: a nave não precisa saber onde as balas vivem na lista. Ela chama `onRequestBullet(idx, x, y)`; o `MainGame` decide criar e adicionar a bala na lista. Isso facilita reaproveitar a nave em outro contexto.

---

## 6. O rio procedural (`RiverField`)

`js/river-field.js`. O rio é uma lista de **fatias horizontais** (`segments`), cada uma sabendo onde começam as margens esquerda e direita. A cada quadro:
- A rolagem (`scrollY`) avança conforme `baseScrollSpeed × scrollSpeedMult`.
- Quando avança uma fatia inteira, a de baixo é descartada e uma nova é **gerada no topo** (meandro suave + largura oscilante), reciclando a lista.

A função-chave para colisão é **`getBoundsAtY(screenY)`**, que devolve `{left, right}` da água navegável naquela altura. A nave usa isso para detectar batida na margem.

> Para mudar o "sabor" do rio (mais sinuoso, mais estreito, ilhas), mexa em `_appendNewSegment()` e nas constantes `MIN_WIDTH`/`MAX_WIDTH`.

---

## 7. A nave (`Player`) — uma classe, dois jogadores

`js/player.js`. O segredo do co-op: a **mesma classe** serve a P1 e P2. Ao definir `playerIdx` (0 ou 1), ele monta os nomes das ações de input (`p1_*` ou `p2_*`) e lê só as suas. O `InputManager` agrega teclado **e** gamepad + toque, então um jogador pode usar controle e o outro teclado sem nenhuma lógica extra.

Responsabilidades: movimento, tiro (com cooldown), consumo de combustível, colisão com margem (via `getBoundsAtY`) e com inimigos/tanques (via distância euclidiana), morte e renascimento com piscar.

---

## 8. Inimigos, tanques e spawner

- **`Enemy`** (`js/enemy.js`): uma classe para três tipos (`BOAT`, `HELI`, `JET`) que diferem em cor, pontos e movimento. A velocidade escala com `enemySpeedMult`. Recebe tiro via `hit()`, creditando os pontos ao atirador certo (importante no co-op).
- **`FuelDepot`** (`js/fuel-depot.js`): tanque coletável; ao ser tocado, reabastece e dá pontos.
- **`Spawner`** (`js/spawner.js`): gera inimigos e tanques no topo, **dentro das margens atuais** do rio. A frequência escala com `enemyDensityMult`.

> Para um novo tipo de inimigo: adicione um valor ao `EnemyType`, trate-o no construtor, `update()` e `draw()` do `Enemy`, e inclua no sorteio do `Spawner`.

---

## 9. HUD

`js/hud.js` é desenhada diretamente no Canvas, escuta os eventos de `GameState` e se adapta a 1 ou 2 jogadores. As barras de combustível mudam de verde para vermelho conforme esvaziam.

---

## 10. Input (`InputManager`)

`js/input.js` centraliza todo o input:
- **Teclado**: mapeamento fixo (WASD P1, Setas P2, Espaço/Enter para tiro).
- **Gamepad**: Gamepad API do navegador — analógico, D-pad e botões.
- **Toque**: Os botões HTML do D-pad e FIRE injetam estado no `touchState`, que é verificado pelo `InputManager.isActionPressed()`.

> Para adicionar novo mapeamento: edite os maps em `InputManager` e/ou os botões em `index.html`.

---

## 11. Como adicionar coisas comuns (receitas rápidas)

| Quero... | Onde mexer |
|----------|-----------|
| Novo tipo de inimigo | `js/enemy.js` (EnemyType + métodos) e `js/spawner.js` (sorteio) |
| Power-up | Nova classe + tratar em `MainGame._checkCollisions()` |
| Nova configuração persistente | `js/game-settings.js` (variável + save/load) |
| Mudar cores/tema | `js/palette.js` |
| Mudar regra de combustível/pontos | `js/game-state.js` e `js/player.js` |
| Tela de pausa visual | Adicionar estado de pausa no `MainGame` + overlay no `draw()` |
| Controles de toque adicionais | Botões em `index.html` + integração no `InputManager` |
| Áudio | Criar `js/audio.js` com Web Audio API, chamar nos eventos apropriados |
| PWA/offline | Adicionar Service Worker + `manifest.json` |

---

## 12. Notas de portabilidade

O jogo agora é **100% web** e não depende de nenhuma engine:
- Canvas 2D é suportado por todos os navegadores modernos (Chrome, Firefox, Safari, Edge).
- Gamepad API é amplamente suportada em desktop e alguns navegadores mobile.
- `localStorage` persiste configurações entre sessões.
- A renderização é toda procedural (sem assets externos de imagem), garantindo carregamento instantâneo.
- O tamanho total do projeto é inferior a 50 KB (sem minificação).

### Compatibilidade testada
- ✅ Chrome 90+
- ✅ Firefox 90+
- ✅ Safari 15+
- ✅ Edge 90+
- ✅ Chrome Mobile / Safari Mobile (com controles de toque)

---

## 13. Histórico da migração (Godot → Web)

A migração preservou toda a lógica do jogo original em GDScript, convertendo para JavaScript ES6 modules:

| Conceito Godot | Implementação Web |
|----------------|-------------------|
| `extends Node2D` + `_process(delta)` | Classe JS com `update(delta)` |
| `_draw()` + `draw_colored_polygon()` | `draw(ctx)` usando Canvas 2D API |
| `Input.is_action_pressed()` | `InputManager.isActionPressed()` |
| `signal` + `emit_signal()` | Sistema de eventos com `listeners` |
| `Autoload` singletons | Módulos ES6 importados |
| `ConfigFile` + `user://` | `localStorage` |
| `PackedVector2Array` + `Vector2` | Arrays de coordenadas + objetos `{x, y}` |
| `queue_free()` | Marcar `dead = true` + `filter()` no array |
| `randf_range()` | `Math.random()` |
| `lerp()` | Interpolação linear manual |
| `fmod()` | Operador `%` |
| `deg_to_rad()` | `× Math.PI / 180` |
| `get_tree().change_scene()` | `App.switchScene()` |
| Scenes (`.tscn`) | Classes JS instanciadas pelo `App` |
