# 🌾 FarmHub API

API para gerenciamento de produtores rurais, propriedades e culturas, desenvolvida em **NestJS** com **TypeScript**, utilizando **PostgreSQL** como banco de dados e **TypeORM** como ORM.  

O sistema permite cadastrar e gerenciar produtores, suas fazendas, safras e culturas plantadas, além de fornecer relatórios consolidados para visualização em dashboards.  

## 🚀 Tecnologias

- [NestJS](https://nestjs.com/)  
- [TypeScript](https://www.typescriptlang.org/)  
- [PostgreSQL](https://www.postgresql.org/)  
- [TypeORM](https://typeorm.io/)  
- [Docker](https://www.docker.com/)  
- [Jest](https://jestjs.io/) para testes

## 📦 Como iniciar o projeto

### 1. Clonar o repositório
```bash
git clone https://github.com/seu-usuario/farmhub-api.git
cd farmhub-api
```

### 2. Criar arquivo .env

Copie o arquivo de exemplo e renomeie para `.env`:

```bash
cp .env.example .env
```

### 3. Subir containers com Docker

Execute o comando abaixo para iniciar a aplicação e o banco de dados:

```bash
docker-compose up --build
```

Isso irá subir:
- API NestJS em http://localhost:3000
- Postgres em http://localhost:5432

## 🧪 Testes

Rodar todos os testes:

```bash
yarn test
```

```bash
yarn test:e2e
```

## 📊 Funcionalidades principais

- Cadastro, edição e exclusão de **produtores**  
- Cadastro de **propriedades rurais** associadas a produtores  
- Registro de **safras e culturas plantadas**  
- Validação de **CPF/CNPJ**  
- Validação de áreas (**arável + vegetação ≤ total**)  
- Dashboard com:  
  - Total de fazendas cadastradas  
  - Total de hectares registrados  
  - Distribuição por estado  
  - Distribuição por cultura  
  - Uso do solo (**arável vs vegetação**)  


## 📖 Documentação da API

A documentação OpenAPI (Swagger) estará disponível em:  

👉 [http://localhost:3000/api-docs](http://localhost:3000/api-docs)  

Além disso, a API expõe os endpoints para obter a especificação em diferentes formatos:  

- **JSON:** [http://localhost:3000/api-docs-json](http://localhost:3000/api-docs-json)  
- **YAML:** [http://localhost:3000/api-docs-yaml](http://localhost:3000/api-docs-yaml)  

> 💡 Também está disponível o arquivo **OpenAPI padrão em YAML** diretamente no repositório.  