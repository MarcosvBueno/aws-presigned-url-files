# AWS Presigned URL Files

Uma aplicação React moderna para upload de arquivos utilizando URLs pré-assinadas do Amazon S3. O projeto oferece uma interface intuitiva de drag-and-drop com acompanhamento de progresso em tempo real e tratamento robusto de erros.

## 📋 Sobre o Projeto

Este projeto demonstra uma implementação completa e robusta para upload de arquivos para AWS S3 utilizando URLs pré-assinadas. A arquitetura serverless garante que o backend controle as permissões de upload enquanto o frontend realiza o upload diretamente para o S3, com rastreamento automático de status através de triggers e DynamoDB, proporcionando uma solução escalável e eficiente.

### ✨ Funcionalidades

- 🎯 Interface drag-and-drop intuitiva
- 📊 Acompanhamento de progresso de upload em tempo real
- 🔒 Upload seguro utilizando URLs pré-assinadas do AWS S3
- 🗑️ Remoção de arquivos da fila antes do upload
- 🎨 Interface moderna e responsiva
- 🔔 Notificações de sucesso/erro
- 🚀 Upload paralelo de múltiplos arquivos
- 📊 Rastreamento automático de status via DynamoDB
- ⚡ Triggers S3 para atualização automática de status

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 19.1.0** - Biblioteca principal para construção da interface
- **TypeScript** - Tipagem estática para maior robustez
- **Vite** - Build tool moderna e rápida
- **Tailwind CSS 4.1.11** - Framework CSS utilitário
- **Axios** - Cliente HTTP para requisições
- **React Dropzone** - Componente drag-and-drop
- **Lucide React** - Biblioteca de ícones
- **Radix UI** - Componentes acessíveis (Progress, Slot)
- **Sonner** - Biblioteca de notificações toast

### Ferramentas de Desenvolvimento
- **ESLint** - Linting e formatação de código
- **TypeScript ESLint** - Regras específicas para TypeScript

### Arquitetura AWS
- **AWS S3** - Armazenamento de arquivos
- **AWS Lambda** - Geração de URLs pré-assinadas e processamento de triggers
- **Amazon DynamoDB** - Rastreamento de status dos uploads
- **S3 Event Notifications** - Triggers automáticos para atualização de status

## 🏗️ Arquitetura

<img width="1076" height="694" alt="image" src="https://github.com/user-attachments/assets/758d8d89-8277-4e38-83b6-a48b144b3c36" />


### Fluxo de Upload

1. **Seleção de Arquivo**: Usuário seleciona arquivos via drag-and-drop ou clique
2. **Requisição de URL**: Frontend solicita URL pré-assinada para cada arquivo via Lambda
3. **Validação e Registro**: Lambda valida o arquivo, gera URL com permissões temporárias e salva status "PENDING" no DynamoDB
4. **Upload Direto**: Frontend faz upload diretamente para S3 usando a URL pré-assinada
5. **Trigger S3**: Quando o arquivo é carregado no S3, um evento é disparado
6. **Atualização de Status**: Lambda de trigger atualiza o status para "UPLOADED" no DynamoDB
7. **Progresso**: Acompanhamento em tempo real do progresso de cada upload no frontend

## 🚀 Como Executar o Projeto

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- Conta AWS configurada (para o backend)

### Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/MarcosvBueno/aws-presigned-url-images.git
cd aws-presigned-url-images
```

2. **Instale as dependências**
```bash
npm install
```

3. **Execute o projeto em modo de desenvolvimento**
```bash
npm run dev
```

4. **Acesse a aplicação**
Abra [http://localhost:5173](http://localhost:5173) no seu navegador

### Scripts Disponíveis

```bash
npm run dev      # Inicia o servidor de desenvolvimento
npm run build    # Gera build de produção
npm run preview  # Preview do build de produção
npm run lint     # Executa o linter
```

## 🌐 Backend/Infraestrutura

O projeto utiliza uma arquitetura serverless completa na AWS:

### Componentes AWS

- **AWS Lambda (Presigned URL)**: `https://klh52wtuwl7c4xsbkvxdnh2v3a0pgruo.lambda-url.us-east-1.on.aws/`
- **AWS Lambda (S3 Trigger)**: Processa eventos de upload e atualiza status
- **Amazon S3**: Armazenamento de arquivos com event notifications
- **Amazon DynamoDB**: Tabela para rastreamento de status dos uploads
- **Região**: `us-east-1`

### Fluxo de Dados

1. **Geração de URL**: Lambda recebe requisição e retorna URL pré-assinada
2. **Registro no DynamoDB**: FileKey é salvo com status "PENDING"
3. **Upload S3**: Arquivo é enviado diretamente para o bucket
4. **Trigger Automático**: S3 dispara evento para Lambda de processamento
5. **Atualização de Status**: DynamoDB é atualizado para "UPLOADED"

### APIs

#### Geração de URL Pré-assinada

**Requisição:**
```typescript
POST /
{
  "fileName": "exemplo.png"
}
```

**Resposta:**
```typescript
{
  "signedUrl": "https://bucket.s3.amazonaws.com/...",
  "fileKey": "unique-file-key"
}
```

#### Estrutura do DynamoDB

**Tabela de Status:**
```json
{
  "fileKey": "string",     // Chave primária
  "status": "PENDING",     // PENDING | UPLOADED | FAILED
  "fileName": "string",    // Nome original do arquivo
  "uploadedAt": "timestamp",
  "metadata": {
    "size": "number",
    "contentType": "string"
  }
}
```

### Código das Funções Lambda

#### 1. Lambda de Geração de URL Pré-assinada

```javascript
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from 'node:crypto'
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb"

const s3Client = new S3Client();
const dynamoDBClient = new DynamoDBClient();

export const handler = async (event) => {

    const {fileName} = JSON.parse(event.body);

    if(!fileName) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: 'file name is required'
            })
        }
    }

    const fileKey = `${randomUUID()}-${fileName}`;
 
    const s3Command = new PutObjectCommand({
        Bucket: 'nome-do-seu-bucket',
        Key: fileKey,
    });
    
    const dynamoDBCommand = new PutItemCommand({
        TableName: 'presigned-url-files',
        Item: {
            fileKey: {
                S: fileKey
            },
            originalFileName: {
                S: fileName
            },
            status: {
                S: 'PENDING'
            },
            expiresAt: {
                N: (Date.now() + 60000).toString()
            },
        }
    });

    const signedUrl = await getSignedUrl(s3Client, s3Command, {expiresIn: 60});

    await dynamoDBClient.send(dynamoDBCommand);

    return {
        statusCode: 200,
        body: JSON.stringify({
            signedUrl,
            fileKey
        })
   
    }
};
```

#### 2. Lambda Trigger S3 (Atualização de Status)

```javascript
import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { PutCommand } from '@aws-sdk/lib-dynamodb';

const dynamoDBClient = new DynamoDBClient()

export const handler = async (event) => {

  const commands = event.Records.map(record => {
    return new UpdateItemCommand({
      TableName: "presigned-url-files",
      Key: {
        fileKey: {
          S: decodeURIComponent(record.s3.object.key),
        }
      },
      UpdateExpression: "SET #status = :status REMOVE #expiresAt",
      ExpressionAttributeNames: {
        "#status": "status",
        "#expiresAt": "expiresAt",
      },
      ExpressionAttributeValues: {
        ":status": { S: "UPLOADED" },
      },
    });
  })

  await Promise.all(commands.map(command => dynamoDBClient.send(command)))
}
```

## 📁 Estrutura do Projeto

```
src/
├── components/
│   └── ui/               # Componentes UI reutilizáveis
│       ├── button.tsx
│       ├── progress.tsx
│       └── sonner.tsx
├── lib/
│   └── utils.ts          # Utilitários (cn, etc.)
├── services/
│   ├── getPresignedUrl.ts # Serviço para obter URLs pré-assinadas
│   └── uploadFile.ts      # Serviço para upload de arquivos
├── styles/
│   └── index.css         # Estilos globais
├── App.tsx               # Componente principal
└── main.tsx              # Entrada da aplicação
```

## 🔧 Configuração

### Pré-requisitos AWS

Para executar este projeto, você precisará configurar os seguintes recursos na AWS:

1. **S3 Bucket**
   - Bucket para armazenamento de arquivos
   - Configuração de CORS para permitir uploads do frontend
   - Event notifications configuradas para trigger de Lambda

2. **DynamoDB Table**
   - Tabela com `fileKey` como chave primária
   - Atributos: `status`, `fileName`, `uploadedAt`, `metadata`

3. **AWS Lambda Functions**
   - Função para geração de URLs pré-assinadas
   - Função para processamento de triggers S3
   - Permissões adequadas para S3 e DynamoDB

4. **IAM Roles**
   - Role para Lambda com permissões de S3 e DynamoDB
   - Políticas de acesso adequadas

### Variáveis de Ambiente

Para desenvolvimento local, você pode configurar:

```env
VITE_LAMBDA_URL=sua-lambda-url-aqui
VITE_AWS_REGION=us-east-1
VITE_S3_BUCKET=seu-bucket-s3
```

### Personalização

- **Tamanho máximo**: Atualmente limitado a 1MB (configurável no Lambda)
- **Tipos de arquivo**: PNG (configurável no Lambda)
- **Região AWS**: us-east-1 (configurável)
- **Tabela DynamoDB**: Configurável para diferentes ambientes
- **Bucket S3**: Configurável com diferentes políticas de acesso

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Marcos Bueno**
- GitHub: [@MarcosvBueno](https://github.com/MarcosvBueno)

---

⭐ Se este projeto te ajudou, considere dar uma estrela no repositório!
