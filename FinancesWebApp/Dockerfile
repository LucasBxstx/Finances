FROM node:latest AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
RUN npm install -g @angular/cli
COPY . .
RUN npm run build --configuration=production
FROM nginx:latest
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/finances/browser /usr/share/nginx/html
EXPOSE 80

# Build: docker build -t finances-nodejs .
# Run: docker run -d -p 8080:80 finances-nodejs