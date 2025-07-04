# 🚀 Mars Rover Photos API (Node.js)

API Node.js que consome a **API pública da NASA** para retornar imagens tiradas pelos rovers em Marte.

## 📸 Funcionalidades

- Consulta fotos dos rovers **Curiosity**, **Opportunity** e **Spirit** por sol (dia marciano), câmera e página.
- Lista as câmeras disponíveis por rover.
- Salva um **histórico das últimas consultas** em `consultas.json`, incluindo a URL completa da requisição.

---

## 🚀 Como rodar o projeto

1. Clone o repositório ou baixe os arquivos
2. Instale as dependências:

```bash
npm install
```

3. Crie o arquivo `.env` com sua chave da API da NASA:

```env
NASA_API_KEY=DEMO_KEY
```

> Você pode usar `DEMO_KEY` para testes, mas há limite por hora. Cadastre-se em https://api.nasa.gov para obter sua chave gratuita.

4. Inicie o servidor:

```bash
node index.js
```

---

## 🧪 Endpoints disponíveis

### 🔍 `GET /mars/photos`

Consulta fotos do rover com os parâmetros:

| Parâmetro   | Tipo     | Obrigatório | Exemplo       |
|-------------|----------|-------------|---------------|
| `rover`     | string   | ✔           | `curiosity`   |
| `sol`       | int      | ✔           | `1000`        |
| `camera`    | string   | ✖           | `FHAZ`        |
| `page`      | int      | ✖ (padrão 1)| `1`           |
| `chave_api` | string   | ✖           | `DEMO_KEY`    |

**Exemplo:**

```
GET http://localhost:3000/mars/photos?rover=curiosity&sol=1000&camera=FHAZ&page=1
```

---

### 🎥 `GET /mars/cameras`

Retorna a lista de câmeras disponíveis para cada rover.

```
GET http://localhost:3000/mars/cameras
```

---

### 📂 `GET /mars/consultas`

Retorna o histórico das últimas 50 consultas feitas à API, com data e URL.

```
GET http://localhost:3000/mars/consultas
```

---

## 📝 Histórico

As consultas ficam salvas automaticamente em `consultas.json`.

---

## 📄 Licença

Uso livre para fins de estudo e aprendizado 🚀