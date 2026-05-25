# Novo River Raid

Clone modernizado do clássico **River Raid**, feito em **Godot Engine 4**, com:

- 🎮 **Co-op local para 2 jogadores** na mesma tela, cada um com sua nave e seu controle
- 🕹️ **Suporte nativo a joystick** (plug & play) + teclado, com **controles remapeáveis**
- ⚙️ **Dificuldade ajustável**: velocidade de rolagem, densidade de inimigos, consumo de combustível e velocidade dos inimigos
- 🎨 **Visual pixel art retrô refinado**, desenhado por código (sem dependência de assets externos)
- 💾 **Zero-config**: as preferências são salvas automaticamente; o jogo roda direto
- 📱 Arquitetura pronta para exportar para **Windows, Linux, Mac, Android e Web (HTML5)** sem reescrever código

---

## Como abrir e jogar

1. Instale o **Godot 4.2+** (versão padrão, *não* a .NET/Mono): https://godotengine.org/download
   - É um único executável (~100 MB). Não precisa instalar nada além disso.
2. Abra o Godot, clique em **Importar**, e selecione o arquivo `project.godot` desta pasta.
3. Pressione **F5** (ou o botão ▶ no canto superior direito) para rodar.

### Para gerar o executável final (zero-config para quem joga)
No editor: menu **Projeto → Exportar → Adicionar → Windows Desktop** (instale o template quando solicitado) → **Exportar Projeto**. O `.exe` gerado roda com duplo clique, sem instalar nada.

---

## Controles padrão

| Ação | Jogador 1 | Jogador 2 |
|------|-----------|-----------|
| Mover | `W A S D` | Setas ↑ ↓ ← → |
| Atirar | `Espaço` | `Enter` |
| Pausar | `Esc` | — |

**Joystick:** conecte um controle e ele funciona automaticamente. O primeiro controle vira o P1, o segundo vira o P2. Analógico/D-pad movem, botão A/✕ atira.

Tudo isso pode ser reconfigurado em **Configurações → Controles**.

---

## Estrutura do projeto

```
Novo River Raid/
├── project.godot          # Configuração + mapa de input (P1/P2, teclado+joystick)
├── icon.svg               # Ícone
├── scenes/                # Cenas (.tscn) — enxutas, lógica fica nos scripts
├── scripts/
│   ├── globals/           # Autoloads: GameSettings, GameState, Palette
│   ├── player/            # Nave e projétil
│   ├── world/             # Rio procedural, spawner, fim de jogo (Main)
│   ├── enemies/           # Inimigos
│   └── ui/                # Menus e HUD
├── README.md
└── DOCUMENTACAO.md        # Documentação técnica detalhada
```

Veja **`DOCUMENTACAO.md`** para a arquitetura completa e como estender o jogo.

---

## Roadmap

- [x] **Fase 1 — Base jogável**: nave, rio com rolagem, tiro, combustível, inimigos (barco/heli/jato), HUD, menus, dificuldade ajustável, remapeamento de controles, co-op de 2 jogadores
- [ ] **Fase 2 — Conteúdo**: pontes (fim de setor), explosões com partículas, áudio (motor, tiro, explosão), tela de pausa visual, recordes locais
- [ ] **Fase 3 — Polimento comercial**: skins de naves, temas visuais, mais tipos de inimigos, power-ups, fases/setores nomeados
- [ ] **Fase 4 — Portabilidade**: exportação Android (com controles de toque na tela) e Web app (HTML5)

---

## Licença e créditos

Projeto pessoal inspirado no River Raid (1982, Activision / Carol Shaw). Este é um clone original — não usa nenhum asset ou código do jogo original.
