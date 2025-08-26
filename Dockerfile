FROM node:lts

ENV TZ="Asia/Jakarta"

# WORKDIR /app

# COPY ./app /app

# EXPOSE 3000

# RUN npm install

# RUN npx prisma generate

# CMD ["sh", "-c", "npx prisma db push && npm run dev"]