# Novo River Raid

Clone modernizado do clássico **River Raid**, agora como **Web App** puro (HTML5 Canvas + JavaScript), sem dependência de nenhuma engine de jogo.

- 🎮 **Co-op local para 2 jogadores** na mesma tela, cada um com sua nave e seu controle
- 🕹️ **Suporte nativo a gamepad** (plug & play) + teclado + **controles de toque para celular**
- ⚙️ **Dificuldade ajustável**: velocidade de rolagem, densidade de inimigos, consumo de combustível e velocidade dos inimigos
- 🎨 **Visual pixel art retrô refinado**, desenhado por código (sem dependência de assets externos)
- 💾 **Zero-config**: as preferências são salvas automaticamente no navegador; o jogo roda direto
- 🌐 **Roda em qualquer navegador** — sem instalação, sem engine, sem plugins
- 📱 **Responsivo** — funciona em desktop, tablet e celular

---

## Como jogar

### Opção 1 — Abrir diretamente no navegador
Basta abrir o arquivo `index.html` no seu navegador. Nenhuma instalação ou servidor é necessária.

### Opção 2 — Servidor local (recomendado para desenvolvimento)
```bash
# Com Python 3
python3 -m http.server 8000

# Com Node.js
npx serve .

# Com Bun
bunx serve .
```
Depois acesse `http://localhost:8000` no navegador.

### Opção 3 — Hospedagem online
Faça deploy em qualquer serviço de hospedagem estática (GitHub Pages, Netlify, Vercel, etc.). Basta servir a pasta do projeto.

---

## Controles padrão

### Teclado

| Ação | Jogador 1 | Jogador 2 |
|------|-----------|-----------|
| Mover | `W A S D` | Setas ↑ ↓ ← → |
| Atirar | `Espaço` | `Enter` |
| Pausar | `Esc` | — |

### Gamepad
Conecte um controle e ele funciona automaticamente. O primeiro controle vira o P1, o segundo vira o P2. Analógico/D-pad movem, botão A/✕ atira.

### Celular (toque)
Botões virtuais aparecem automaticamente em dispositivos de toque: D-pad à esquerda, botão FIRE à direita.

Tudo isso pode ser reconfigurado em **Configurações → Controles**.

---

## Estrutura do projeto

```
Novo River Raid/
├── index.html              # Ponto de entrada — abre direto no navegador
├── css/
│   └── style.css           # Estilos responsivos + controles de toque
├── js/
│   ├── app.js              # Orquestrador de cenas (main loop)
│   ├── palette.js          # Paleta de cores centralizada
│   ├── game-settings.js    # Configurações (dificuldade, jogadores, save/load)
│   ├── game-state.js       # Estado da partida (pontuação, vidas, combustível)
│   ├── input.js            # Gerenciador de input (teclado + gamepad + toque)
│   ├── river-field.js      # Rio procedural (terreno, água, céu, árvores)
│   ├── player.js           # Nave do jogador
│   ├── bullet.js           # Projétil
│   ├── enemy.js            # Inimigos (Barco, Helicóptero, Jato)
│   ├── fuel-depot.js       # Tanque de combustível
│   ├── spawner.js          # Spawner de inimigos e depósitos
│   ├── hud.js              # HUD (pontuação, vidas, combustível)
│   ├── main-menu.js        # Tela de título
│   ├── settings-menu.js    # Tela de configurações
│   └── game-over.js        # Tela de fim de jogo
├── assets/
│   └── icon.svg            # Ícone do jogo
├── README.md
└── DOCUMENTACAO.md         # Documentação técnica detalhada
```

Veja **`DOCUMENTACAO.md`** para a arquitetura completa e como estender o jogo.

---

## Roadmap

- [x] **Fase 1 — Base jogável**: nave, rio com rolagem, tiro, combustível, inimigos (barco/heli/jato), HUD, menus, dificuldade ajustável, co-op de 2 jogadores
- [x] **Fase 4 — Portabilidade Web**: conversão completa de Godot Engine 4 para Web App HTML5 Canvas puro
- [ ] **Fase 2 — Conteúdo**: pontes (fim de setor), explosões com partículas, áudio (motor, tiro, explosão), tela de pausa visual, recordes locais
- [ ] **Fase 3 — Polimento comercial**: skins de naves, temas visuais, mais tipos de inimigos, power-ups, fases/setores nomeados
- [ ] **PWA**: Service Worker para funcionar offline, instalação como app

---

## Migração do Godot Engine 4 para Web App

Este projeto foi originalmente desenvolvido em Godot Engine 4 (GDScript) e foi completamente refatorado para rodar como Web App puro. A migração preservou toda a lógica de jogo, visual e funcionalidades:

| Componente Godot | Equivalente Web |
|-------------------|-----------------|
| `project.godot` | `index.html` + `css/style.css` |
| GDScript (`.gd`) | JavaScript ES6 modules (`.js`) |
| `_draw()` / `draw_colored_polygon()` | Canvas 2D API (`ctx.beginPath()`, `ctx.fill()`) |
| `InputMap` / `Input.is_action_pressed()` | `InputManager` (teclado + Gamepad API + toque) |
| `Autoload` singletons | Módulos ES6 (`game-settings.js`, `game-state.js`) |
| Signals | Sistema de eventos customizado (`listeners`) |
| `ConfigFile` / `user://settings.cfg` | `localStorage` |
| Scenes (`.tscn`) | Classes JavaScript com `draw(ctx)` |
| `_process(delta)` | `requestAnimationFrame` loop |

**Deletável:** Godot Engine 4 não é mais necessário. Todo o código Godot (`.gd`, `.tscn`, `project.godot`, `.import`) foi removido.

---

## Licença e créditos

Projeto pessoal inspirado no River Raid (1982, Activision / Carol Shaw). Este é um clone original — não usa nenhum asset ou código do jogo original.
