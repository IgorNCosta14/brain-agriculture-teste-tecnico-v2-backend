## 📑 Índice

1. [Sobre o projeto](#-farmhub-api)  
2. [Tecnologias](#-tecnologias)  
3. [Como iniciar o projeto](#-como-iniciar-o-projeto)  
   - [Clonar o repositório](#1-clonar-o-repositório)  
   - [Criar arquivo .env](#2-criar-arquivo-env)  
   - [Subir containers com Docker](#3-subir-containers-com-docker)  
   - [Rodar a API](#4-rodar-a-api)  
4. [Testes](#-testes)  
5. [Funcionalidades principais](#-funcionalidades-principais)  
6. [Documentação da API](#-documentação-da-api)  
7. [Diagrama de Entidades](#-diagrama-de-entidades)  


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

### 4. Rodar a api

- Instale as dependências:

```bash
yarn install
```
- Gerar build
```bash
yarn build
```
- Iniciar aplicação local
```bash
yarn start
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

## 📐 Diagrama de Entidades
![Diagrama em branco](https://github.com/user-attachments/assets/0c7dc8cf-c86f-4c14-a33c-e2fd364a7d20)
