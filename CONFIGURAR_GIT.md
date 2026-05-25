# Como colocar no GitHub e sincronizar com seu PC

Este guia configura o repositório **https://github.com/AtamisFilho/Novo-River-Raid** sincronizado com a pasta:

```
C:\Users\xc950\Documents\Projetos Claude\Novo River Raid
```

> **Importante (transparência):** eu (assistente) não tenho acesso ao seu PC nem à internet, então não consigo fazer o `push` por você nem montar uma sincronização que rode "sozinha no servidor". O que existe de fato no Git é o ciclo `pull`/`push`. Abaixo deixo isso o mais próximo possível de "um clique". A cada vez que eu te entregar código novo, você cola na pasta e roda o script de sincronização.

---

## Pré-requisitos (uma vez só)

1. **Instale o Git para Windows**: https://git-scm.com/download/win (next-next-finish).
2. **Conta no GitHub** já existente (a sua, AtamisFilho).
3. O repositório `Novo-River-Raid` já criado no GitHub (pode ser vazio).

---

## Opção A — Recomendada para você: **GitHub Desktop** (visual, sem terminal)

É o caminho mais "zero-config" para sincronizar.

1. Baixe e instale: https://desktop.github.com/
2. Faça login com sua conta GitHub.
3. **File → Clone repository →** escolha `AtamisFilho/Novo-River-Raid` →
   em *Local path*, aponte para `C:\Users\xc950\Documents\Projetos Claude\` (ele criará a subpasta `Novo-River-Raid`).
   - ⚠️ Se você quer exatamente a pasta com nome **"Novo River Raid"** (com espaço), clone para lá e mova os arquivos, ou ajuste o nome. O Git funciona com espaços, mas mantenha **uma** pasta só.
4. Copie **todos os arquivos do projeto** (que eu te entreguei) para dentro dessa pasta clonada.
5. No GitHub Desktop, você verá as mudanças listadas. Escreva uma mensagem (ex.: "Fase 1: base jogável") e clique em **Commit to main** → depois **Push origin**.

**A cada alteração futura:** o GitHub Desktop mostra o que mudou; você dá *Commit* + *Push* (dois cliques). Para trazer mudanças, *Fetch/Pull*. Simples e seguro.

---

## Opção B — Via terminal, com scripts de um clique

Eu incluí dois arquivos `.bat` na pasta `tools/`:

- **`setup_git.bat`** — roda **uma vez** para conectar a pasta ao repositório.
- **`sincronizar.bat`** — roda **toda vez que houver mudança**; faz `add + commit + push` automaticamente com data/hora na mensagem.

### Passo 1 — Configuração inicial (uma vez)
Abra a pasta do projeto no Explorer e dê **duplo clique em `tools\setup_git.bat`**.
Ele vai:
- inicializar o Git na pasta (se ainda não for um repositório),
- conectar ao remoto `https://github.com/AtamisFilho/Novo-River-Raid`,
- fazer o primeiro commit e push.

Na primeira vez, o Git pedirá seu login do GitHub (uma janela abre para autenticar). Depois disso ele lembra.

### Passo 2 — Sincronizar a cada mudança
Sempre que você (ou eu, te entregando código) alterar arquivos, dê **duplo clique em `tools\sincronizar.bat`**.
Ele commita tudo e envia para o GitHub. Pronto.

---

## Opção C — Sincronização verdadeiramente automática (avançado, opcional)

Se você quiser que **cada vez que um arquivo for salvo** o push aconteça sozinho, dá para usar um "observador de pasta". Não recomendo de cara (gera muitos commits e pode atrapalhar), mas se quiser, há duas formas:

1. **Tarefa agendada do Windows** chamando `sincronizar.bat` a cada X minutos (Agendador de Tarefas → criar tarefa básica → repetir a cada 5 min → ação: o `.bat`). Simples e robusto.
2. **GitHub Actions** para a parte de *documentação/CI*: a cada `push`, o GitHub pode validar o projeto, gerar páginas, etc. Incluí um workflow de exemplo em `.github/workflows/`. Isso roda **no GitHub depois do push**, não substitui o envio do seu PC.

---

## Dica sobre o que vai (e o que não vai) para o repositório

O `.gitignore` já está configurado para **não** enviar a pasta `.godot/` (cache do editor) nem builds/executáveis. Isso mantém o repositório limpo, só com o código-fonte e a documentação — exatamente o que deve ser versionado.

---

## Resolução de problemas rápidos

| Problema | Solução |
|----------|---------|
| "git não é reconhecido" | Reinstale o Git para Windows e reabra o Explorer |
| Pede usuário/senha toda hora | Use o GitHub Desktop, ou configure o *Git Credential Manager* (vem com o Git para Windows) |
| "rejected / non-fast-forward" no push | Rode `git pull` antes (ou *Fetch* no Desktop); houve mudança no remoto |
| Conflito de merge | O GitHub Desktop mostra os conflitos para resolver visualmente |
