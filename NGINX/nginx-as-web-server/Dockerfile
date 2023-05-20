FROM nginx

RUN apt-get update && apt-get install -y vim

COPY nginx.conf /etc/nginx/nginx.conf

COPY html /usr/webserver/html
COPY images /usr/webserver

EXPOSE 8080
EXPOSE 8888

CMD ["nginx", "-g", "daemon off;"]
