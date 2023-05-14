**httpd Image** :

```Dockerfile
FROM httpd
RUN apt-get update
RUN apt-get install -y iputils-ping
RUN apt-get install -y inetutils-traceroute
RUN apt-get install -y iproute2
RUN apt-get install -y curl telnet vim
```


default docker bridge network

access an image bash

```shell
docker exec -it s2 bash 
```

**Create a network**
```shell
docker network create backend --subnet 10.0.0.0/24
```
In the command `docker network create backend --subnet 10.0.0.0/24`, the `--subnet 10.0.0.0/24` option specifies the subnet range for the newly created Docker network "backend".
The subnet range defines the IP address space that can be used by containers connected to the network. In this case, the subnet range is `10.0.0.0/24`, which means that containers on the "backend" network will be assigned IP addresses in the range of `10.0.0.1` to `10.0.0.254`, with a subnet mask of `255.255.255.0`


**Add S1, S2 containers to new backend network**
```shell
docker network connect backend s1
docker network connect backend s2
```

Then when we inspect the network `backend`:
```shell
docker inspect network backend  
```

```json
[
    {
        "Name": "backend",
        "Id": "2444b37d3bccf80b47b5b111e887efa768d9b22aafc80a1a7a071334eed44019",
        "Created": "2023-05-14T11:39:31.890391107Z",
        "Scope": "local",
        "Driver": "bridge",
        "EnableIPv6": false,
        "IPAM": {
            "Driver": "default",
            "Options": {},
            "Config": [
                {
                    "Subnet": "10.0.0.0/24"
                }
            ]
        },
        "Internal": false,
        "Attachable": false,
        "Ingress": false,
        "ConfigFrom": {
            "Network": ""
        },
        "ConfigOnly": false,
        "Containers": {
            "eb11ee9b2c176cca3df95de649a4de1e3dc04b43f40108c498943287f78c081d": {
                "Name": "s1",
                "EndpointID": "dd820f0b9edfa3aa7b5e48c83636dc512ec2d09e1e903832869d68fc7315f5e4",
                "MacAddress": "02:42:0a:00:00:02",
                "IPv4Address": "10.0.0.2/24",
                "IPv6Address": ""
            },
            "f8966d701a3e78ba35f896824496264fe153ff94394038803dcd42de54d61e10": {
                "Name": "s2",
                "EndpointID": "ed2861a9a90579a52289c75111cca1e6448dcc8a7c24e00b2fe1cccb08888764",
                "MacAddress": "02:42:0a:00:00:03",
                "IPv4Address": "10.0.0.3/24",
                "IPv6Address": ""
            }
        },
        "Options": {},
        "Labels": {}
    }
]

```

We will observe that the containers s1 and s2 are both part of the same network `backend` and have been assigned IP addresses of `10.0.0.2` and `10.0.0.3`, respectively.

And we can ping both containers in their interactive container bash using their hostname:
s1:
```
$: curl s2
<html><body><h1>This is S2</h1></body></html>
```

s2:
```
$: curl s1
<html><body><h1>This is S1</h1></body></html>
```


**remove s1, s2 from bridge n/w**:
```shell
docker network disconnect bridge s1
docker network disconnect bridge s2
```


Now we will isolate s1, s2 into their own networks, we will  disconnect s2 from `backend` n/w, and create new n/w `frontend` for s2.

```shell
docker network create frontend --subnet 10.0.1.0/24
docker network disconnect backend s2
docker network connect frontend s2
```

In Production env, it's recommended to isolate different system components into their own networks to mitigate critical network exposure to public.

`hostname -i` -> get ip address

```shell
docker run --name s1 --network backend --cap-add=NET_ADMIN -d nhttpd

docker run --name s2 --network frontend --cap-add=NET_ADMIN -d nhttpd
```

create a gateway for backend:

```shell
docker run --name gw --network backend -d nhttpd
```

connect the gateway to frontend
```shell
docker network connect frontend gw
```

inside s2 container add role:
```shell
ip route add 10.0.0.0/24 via 10.0.1.3
```

inside s1 container:
```shell
ip route add 10.0.1.0/24 via 10.0.0.3
```