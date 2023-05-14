**Setup Nginx configurations:**

```nginx
http{
    upstream nodebackend {
        server nodeapp1:8080;
        server nodeapp2:8080;
        server nodeapp3:8080;
    }
    server {
        listen 80;
        server_name localhost;
        location / {
            proxy_pass http://nodebackend;
        }
    }
}
events {}
```


-   Sets up a reverse proxy to distribute incoming HTTP requests across multiple instances of a Node.js application.
-   Defines a group of backend servers that Nginx will use to proxy requests using the `upstream` block. In this example, there are three backend servers specified (`nodeapp1:8080`, `nodeapp2:8080`, and `nodeapp3:8080`).
-   Listens for incoming requests on port 80 and responds to requests for the `localhost` domain using the `server` block.
-   Proxies requests to the backend servers defined in the `upstream` block using the `location /` block, which defines the URL path that Nginx will use to proxy requests.
-   Uses a round-robin load balancing algorithm to distribute incoming requests evenly across the backend servers, improving the overall performance and reliability of the application.

[An architecture of one nginx instance load balance requests to 3 nodeapp instances](RR-3-apps-1-lb.png)


**Spin NGINX Instance**
```shell
docker run --name nginx -p 80:8080 --hostname ng1 -v /home/procrew/growth/nginx-course/nginx-http-load-balancing/nginx.conf:/etc/nginx/nginx.conf nginx
```


**Create  nodeapp Image:** 
```shell
docker build . -t nodeapp
```

**Spin 3 nodeapp instances:**
```shell
docker run --hostname nodeapp1 --name nodeapp1 -d nodeapp
docker run --hostname nodeapp2 --name nodeapp2 -d nodeapp
docker run --hostname nodeapp3 --name nodeapp3 -d nodeapp
```


**Create a docker network so Nginx could access nodeapp instances:**

```shell
docker network create backendnet
docker network connect backendnet nodeapp1
docker network connect backendnet nodeapp2
docker network connect backendnet nodeapp3
docker network connect backendnet nginx
```


**Get logs for nginx container:**

```shell
docker logs nginx
```