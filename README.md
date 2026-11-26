<p align="center">
  <img src="front/src/img/logo.png" alt="Logo PalcoLivre" width="260">
</p>

<h1 align="center">PalcoLivre</h1>

<p align="center">
  <strong>A voz da música independente</strong><br>
  Uma plataforma para descobrir bandas independentes, conhecer seus lançamentos e dar palco a novos sons.
</p>

---

## Sobre o projeto

O PalcoLivre é uma aplicação web que aproxima ouvintes e bandas independentes. O público pode explorar artistas e estilos, ouvir faixas e favoritar bandas, álbuns e músicas. Artistas podem criar e administrar um perfil público, publicar álbuns e gerenciar suas faixas.

O repositório contém duas aplicações:

- **Frontend:** aplicação web em React e TypeScript, construída com Vite.
- **Backend:** API REST em Node.js, Express e TypeScript, com persistência via Prisma e PostgreSQL.

## Funcionalidades implementadas

### Para ouvintes

- Página inicial com bandas em destaque, lançamentos recentes e navegação por gênero.
- Consulta de perfis públicos de bandas, discografias, álbuns e faixas.
- Player de áudio persistente com reprodução, pausa, busca na faixa, volume, próxima/anterior e fila.
- Cadastro e login com conta de ouvinte ou de responsável por banda.
- Recuperação e redefinição de senha via e-mail.
- Curtidas em bandas, álbuns e faixas, além de consulta às bandas e faixas curtidas.
- Formulário de contato com uma banda.

### Para bandas

- Criação e edição de perfil, com biografia, integrantes, gênero, contatos, links e imagens.
- Painel para administrar o perfil e o conteúdo da banda.
- Criação, edição e remoção de álbuns e faixas.
- Galeria de fotos do perfil.
- Upload de imagens e áudio para o Cloudflare R2 usando URLs pré-assinadas.
- Limite de até 10 faixas por álbum.

### API e persistência

- Autenticação por JWT e autorização por perfil/permissão.
- Validação de entradas com Zod e tratamento centralizado de erros.
- Senhas protegidas com bcrypt; telefone de contato de banda criptografado com AES-256-GCM.
- Pesquisa e listagem de bandas com filtros por gênero, busca textual e paginação.
- Seções de bandas em destaque, itens recentes e exploração por gênero.
- Health check disponível em `GET /health`.

> **Estado do projeto:** a interface utiliza dados de demonstração como fallback em alguns fluxos quando a API não está disponível. O modelo Prisma já inclui tabelas de playlists, mas não há rotas ou interface de gerenciamento de playlists implementadas no momento. Portanto, nem todas as estruturas do banco representam funcionalidades prontas para uso.

## Tecnologias

| Área | Tecnologias |
| --- | --- |
| Frontend | React 18, TypeScript, Vite |
| Estilos e interface | Tailwind CSS, PostCSS, Framer Motion, Lucide React |
| Backend | Node.js, Express 4, TypeScript |
| Banco de dados | PostgreSQL, Prisma ORM (configurado para uso com Neon) |
| Autenticação e validação | JSON Web Token, bcryptjs, Zod |
| Arquivos | Cloudflare R2, compatível com S3, AWS SDK |
| E-mail | Nodemailer e Mailtrap |
| Segurança HTTP | Helmet e CORS |

## Requisitos

- Node.js 18 ou superior e npm.
- Uma instância PostgreSQL acessível (por exemplo, Neon).
- Credenciais do Cloudflare R2 para uploads de arquivos.
- Credenciais SMTP do Mailtrap para envio de e-mails de cadastro, recuperação de senha e contato.

O backend pode iniciar sem credenciais válidas de R2 ou Mailtrap, mas uploads e envio de e-mails dependem da configuração correta desses serviços.

## Como executar localmente

### 1. Configurar o backend

No PowerShell, na raiz do repositório:

```powershell
Copy-Item back\.env.example back\.env
```

Edite `back\.env` e configure ao menos as URLs de conexão do PostgreSQL:

```env
DATABASE_URL="postgresql://USUARIO:SENHA@HOST/BANCO?sslmode=require"
DIRECT_URL="postgresql://USUARIO:SENHA@HOST/BANCO?sslmode=require"
```

`DATABASE_URL` é usada pela aplicação e pode utilizar a URL com pooling do Neon. `DIRECT_URL` é usada pelo Prisma para operações de migração e deve apontar para uma conexão direta quando o provedor oferecer essa opção.

Configure também os seguintes valores para habilitar todos os serviços:

| Variável | Uso |
| --- | --- |
| `PORT` | Porta da API; padrão `3333`. |
| `API_URL` | URL base da API; padrão `http://localhost:3333`. |
| `FRONTEND_URL` | Origem do frontend autorizada pelo CORS; padrão `http://localhost:5173`. |
| `JWT_SECRET` | Segredo de assinatura dos tokens JWT. Use um valor forte e exclusivo. |
| `JWT_EXPIRES_IN` | Validade do token; padrão `7d`. |
| `ENCRYPTION_KEY` | Chave usada para proteger dados sensíveis; configure um valor secreto com pelo menos 32 caracteres. |
| `CLOUDFLARE_ACCOUNT_ID` | Identificador da conta Cloudflare. |
| `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` | Credenciais de acesso ao bucket R2. |
| `R2_BUCKET_NAME` | Nome do bucket; padrão `palcolivre-media`. |
| `R2_PUBLIC_URL` | URL pública base para os arquivos armazenados. |
| `MAILTRAP_HOST`, `MAILTRAP_PORT`, `MAILTRAP_USER`, `MAILTRAP_PASS` | Configuração SMTP do Mailtrap. |
| `MAIL_FROM` | Remetente usado nos e-mails enviados. |

Os valores de exemplo são apenas placeholders. Não compartilhe nem faça commit do arquivo `back/.env`; ele contém segredos e está excluído pelo `.gitignore`.

Instale as dependências, gere o cliente Prisma, crie a migração inicial e inicie a API:

```powershell
Set-Location back
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run dev
```

A API ficará disponível em `http://localhost:3333`. Para conferir se está ativa, acesse `http://localhost:3333/health`.

> Se o banco já tiver sido configurado ou migrado, não crie uma migração inicial novamente. Use `npm run prisma:migrate` para aplicar migrações existentes em desenvolvimento.

### 2. Configurar o frontend

Em outro terminal, crie `front/.env.local` com a URL base da API:

```env
VITE_API_URL=http://localhost:3333/api
```

Instale as dependências e inicie o Vite:

```powershell
Set-Location front
npm install
npm run dev
```

Abra o endereço exibido pelo Vite, normalmente `http://localhost:5173`.

### 3. Compilar para produção

Execute os comandos abaixo dentro de cada pasta:

```powershell
# Em back\
npm run build
npm start

# Em front\
npm run build
npm run preview
```

Configure as variáveis de ambiente de produção, URLs públicas e origens permitidas antes de publicar. Nunca use os segredos de exemplo em produção.

## Rotas principais da API

Todas as rotas abaixo, exceto `GET /health`, usam o prefixo `/api`. Rotas protegidas exigem o cabeçalho `Authorization: Bearer <token>`.

| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Público | Cadastra uma conta. |
| `POST` | `/api/auth/login` | Público | Autentica e retorna um token JWT. |
| `GET` | `/api/auth/me` | Autenticado | Retorna os dados da conta atual. |
| `POST` | `/api/auth/forgot-password` | Público | Solicita a recuperação de senha. |
| `POST` | `/api/auth/reset-password` | Público | Redefine a senha usando o token recebido. |
| `GET` | `/api/bands` | Público | Lista bandas; aceita `genre`, `search`, `page` e `limit`. |
| `GET` | `/api/bands/:slug` | Público | Retorna o perfil público da banda. |
| `POST` | `/api/bands` | Gestor de banda ou administrador | Cria uma banda. |
| `GET` | `/api/bands/user/my-bands` | Autenticado | Lista bandas gerenciadas pela conta atual. |
| `PUT`, `DELETE` | `/api/bands/:id` | Proprietário ou administrador | Atualiza ou remove uma banda. |
| `POST` | `/api/bands/:slug/contact` | Público | Envia uma mensagem para a banda. |
| `GET` | `/api/albums/:id` | Público | Retorna álbum e faixas. |
| `POST` | `/api/albums` | Autenticado e autorizado | Cria um álbum, opcionalmente com faixas. |
| `PUT`, `DELETE` | `/api/albums/:id` | Proprietário ou administrador | Atualiza ou remove um álbum. |
| `POST` | `/api/albums/:id/tracks` | Autenticado e autorizado | Adiciona uma faixa. |
| `DELETE` | `/api/albums/tracks/:trackId` | Proprietário ou administrador | Remove uma faixa. |
| `GET` | `/api/explore/featured` | Público | Lista bandas e álbuns em destaque. |
| `GET` | `/api/explore/recent` | Público | Lista bandas e álbuns recentes. |
| `GET` | `/api/explore/by-genre/:genre` | Público | Explora bandas e álbuns por gênero. |
| `POST` | `/api/likes/band/:bandId` | Autenticado | Alterna a curtida de uma banda. |
| `POST` | `/api/likes/album/:albumId` | Autenticado | Alterna a curtida de um álbum. |
| `POST` | `/api/likes/track/:trackId` | Autenticado | Alterna a curtida de uma faixa. |
| `GET` | `/api/likes/my-bands`, `/api/likes/my-tracks` | Autenticado | Lista bandas ou faixas curtidas. |
| `POST` | `/api/uploads/presigned-url` | Autenticado | Gera dados para upload direto ao R2. |

O upload começa pela API e continua com um `PUT` do frontend para a URL pré-assinada do R2. As categorias aceitas são `avatar`, `banner`, `gallery`, `album-cover` e `track-audio`; há limites de tipo MIME e tamanho por categoria.

## Estrutura do repositório

```text
PalcoLivre/
├── back/
│   ├── prisma/             # Schema e configuração do banco
│   └── src/
│       ├── config/         # Ambiente, Prisma, e-mail e R2
│       ├── controllers/    # Regras de entrada e saída da API
│       ├── middlewares/    # Autenticação, validação e erros
│       ├── routes/         # Rotas REST
│       ├── schemas/        # Validações Zod
│       └── services/       # Criptografia, e-mail e armazenamento
└── front/
    └── src/
        ├── components/     # Telas e componentes da interface
        ├── context/        # Contextos de autenticação e player
        ├── data/           # Dados de demonstração
        ├── img/            # Logo e imagens
        └── services/       # Comunicação com a API
```

## Scripts disponíveis

### Backend (`back/`)

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia a API em desenvolvimento com reinício automático. |
| `npm run build` | Compila o TypeScript para `dist/`. |
| `npm start` | Inicia a versão compilada. |
| `npm run prisma:generate` | Gera o Prisma Client. |
| `npm run prisma:migrate` | Executa `prisma migrate dev`. |
| `npm run prisma:studio` | Abre o Prisma Studio. |

### Frontend (`front/`)

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento Vite. |
| `npm run build` | Verifica os tipos TypeScript e gera a versão de produção. |
| `npm run preview` | Pré-visualiza a versão compilada. |

## Licença

O backend declara a licença MIT em seu `package.json`. Consulte os arquivos do projeto e de seus recursos antes de redistribuí-los.
