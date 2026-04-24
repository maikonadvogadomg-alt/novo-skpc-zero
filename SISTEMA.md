# SK Code Editor — Informações do Sistema

> Gerado em: 24/04/2026, 20:45:46
> Projeto: **mobile (3)** · 211 arquivo(s)

---

## Terminal

O terminal executa JavaScript real no browser e simula comandos de sistema:

### O que funciona:
- `node <arquivo.js>` — executa JavaScript **real** (async/await suportado!)
- `fetch("https://api.exemplo.com")` — **acesso à internet funcionando** para APIs com CORS
- `require('node-fetch')` ou `require('axios')` → usa fetch nativo do browser automaticamente
- `require('fs')` — lê e escreve arquivos do projeto virtual
- `npm install <pacote>` — atualiza package.json do projeto
- `ls`, `cat`, `mkdir`, `touch`, `rm`, `cp`, `mv` — operações de arquivo
- `echo`, `pwd`, `clear`, `env` — utilitários
- `git status`, `git log` — informações do projeto

### Sobre acesso à internet:
- ✅ APIs públicas com CORS habilitado: OpenAI, GitHub, JSONPlaceholder, etc.
- ✅ `fetch("https://api.github.com/users/nome")` funciona direto
- ⚠️  Algumas APIs bloqueiam chamadas do browser (CORS) — nesses casos use um backend real
- ❌ WebSockets e streams em tempo real não funcionam no modo browser

### Sobre Python:
- `python <arquivo.py>` — **simulado** (mostra prints estáticos)
- Para Python real: use Replit, Google Colab, ou instale localmente

---

## Assistente IA

### Escopos de contexto:
| Escopo | O que é enviado | Tokens estimados |
|--------|----------------|-----------------|
| Projeto | Até 60 arquivos (10k chars cada, total 80k) | ~40.000–200.000 |
| Pasta | Arquivos da pasta atual (12k chars cada) | ~3.000–30.000 |
| Arquivo | Só o arquivo ativo (40k chars) | ~500–10.000 |
| Nenhum | Apenas sua mensagem | ~100–500 |

### Limites por modelo (tokens de entrada):
| Modelo | Limite entrada | Limite saída |
|--------|--------------|-------------|
| GPT-4o | 128.000 tokens | 16.384 tokens |
| GPT-4o-mini | 128.000 tokens | 16.384 tokens |
| GPT-3.5-turbo | 16.385 tokens | 4.096 tokens |
| Claude 3.5 Sonnet | 200.000 tokens | 8.096 tokens |
| Claude 3 Haiku | 200.000 tokens | 4.096 tokens |
| Gemini 1.5 Pro | 1.000.000 tokens | 8.192 tokens |
| Gemini 1.5 Flash | 1.000.000 tokens | 8.192 tokens |

> 1 token ≈ 4 caracteres em inglês / ≈ 3 caracteres em português

### Comandos que a IA entende:
- `filepath:caminho/arquivo.ext` — cria/atualiza arquivo no projeto
- Blocos ```bash``` — exibe botão "Executar no Terminal"
- Você pode pedir: "crie", "corrija", "explique", "refatore", "adicione testes"

---

## Atalhos do Editor

| Ação | Atalho |
|------|--------|
| Salvar | Ctrl+S / ⌘S |
| Desfazer | Ctrl+Z |
| Refazer | Ctrl+Y / Ctrl+Shift+Z |
| Buscar | Ctrl+F |
| Substituir | Ctrl+H |
| Ir para linha | Ctrl+G |
| Formatar | Shift+Alt+F |
| Comentar linha | Ctrl+/ |
| Duplicar linha | Shift+Alt+↓ |
| Mover linha | Alt+↑/↓ |
| Selecionar tudo | Ctrl+A |

---

## Armazenamento

- **Índice de projetos:** `localStorage['sk-editor-projects']` (apenas metadados)
- **Arquivos de cada projeto:** `localStorage['sk-proj-files-{id}']` (chave separada por projeto)
- **Projeto atual:** `localStorage['sk-editor-current']`
- **Auto-save:** a cada 8 segundos e em cada mudança de arquivo
- **Capacidade:** projetos grandes suportados — cada projeto tem sua própria cota de armazenamento
- **Backup seguro:** use ☁️ Backup no Google Drive para projetos maiores que 5MB
- **Exportar tudo:** Painel de Arquivos → ··· na raiz → Exportar como ZIP

---

## Versão

SK Code Editor · Editor de código mobile-first em português  
Monaco Editor + WebAssembly Terminal + IA integrada  
