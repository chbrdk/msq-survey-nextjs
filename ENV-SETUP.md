# Environment Setup

## Create .env.local file

Create a `.env.local` file in the root directory with the following content:

```bash
# OpenAI API Key
OPENAI_API_KEY=your-openai-api-key-here

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27018/msq_survey

# Next.js Public URL
NEXT_PUBLIC_API_URL=http://localhost:7016

# Node Environment
NODE_ENV=development
```

## For Production

For production deployment, update the values:

```bash
OPENAI_API_KEY=your-actual-openai-key
MONGODB_URI=mongodb://mongo:27017/msq_survey
NEXT_PUBLIC_API_URL=https://your-domain.com
NODE_ENV=production
```

