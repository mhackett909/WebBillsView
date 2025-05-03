FROM nginx:alpine

# Copy the static React files into Nginx
COPY build/ /usr/share/nginx/html

# Set up Nginx for React routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
