# Sistema CCA - Emissão de Cartas de Credenciamento

> Migração do HTA legado para aplicação web moderna (Node.js + SQLite)

## Funcionalidades

- Emissão de Cartas CCA em PDF com timbrado oficial
- Numeração sequencial automática por ano
- Histórico de emissões com busca e filtros
- Exportação CSV
- Reimpressão de cartas emitidas
- Configuração de parâmetros (sigla, secretário, gerente)
- Banco de dados SQLite local (sem dependência de rede)

## Como usar (local)

```bash
# 1. Instalar Node.js (https://nodejs.org)
# 2. Executar:
npm install
npm start

# 3. Acessar
# http://localhost:3000
```

> O banco de dados é criado automaticamente na primeira execução.
> Para ambiente local, o banco SQLite fica em `data/cca.db`.

## Deploy no Render (grátis)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/SEU_USUARIO/ccas-system)

Ou manualmente:

1. Crie uma conta em https://render.com
2. Clique em **New +** > **Web Service**
3. Conecte seu repositório do GitHub
4. Preencha:
   - **Name**: `ccas-system`
   - **Region**: escolha a mais próxima
   - **Branch**: `main`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: **Free**
5. Clique em **Create Web Service**
6. Em **Settings** > **Health Check Path**: `/api/status`
7. Pronto! Sua URL será `https://ccas-system.onrender.com`

> **Aviso:** No plano Free do Render, o serviço "dorme" após 15 min de inatividade.
> O banco SQLite é resetado a cada novo deploy. Para dados permanentes,
> considere usar Render Disk ($) ou um banco externo.

## Estrutura

```
ccas-system/
├── server.js           # Servidor Express
├── database.js         # Conexão SQLite
├── package.json
├── routes/
│   └── api.js          # Rotas da API REST
├── models/
│   ├── database.js     # Operações do banco
│   └── seed.js         # Dados iniciais
├── public/
│   ├── index.html      # Frontend SPA
│   ├── css/app.css     # Estilos customizados
│   └── js/app.js       # Lógica do frontend
└── data/               # Banco SQLite (gerado)
```

## API REST

| Método | Rota | Descrição |
|--------|------|-----------|
| GET    | /api/status       | Estado atual (contador, ano, params) |
| PUT    | /api/params       | Atualizar parâmetros |
| GET    | /api/emissions    | Listar emissões |
| POST   | /api/emissions    | Criar nova emissão |
| DELETE | /api/emissions/:id | Remover emissão |

## Migração do HTA

Este projeto substitui o HTA legado (`Emissão CCA - V24`) que usava ActiveX e
compartilhava arquivo JSON em rede (`S:\`). Agora cada usuário tem sua própria
instância com banco SQLite.

Para compartilhamento em rede, configure um servidor centralizado e aponte
todos os usuários para o mesmo endereço.
