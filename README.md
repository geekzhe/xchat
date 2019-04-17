# 基于 websocket 实现的聊天室 demo

* 安装方法

```
$ git clone https://github.com/geekzhe/xchat.git
```

* 启动服务器端

```
$ python3 xchat_server.py
```

* 浏览器访问聊天室

> 注意：
>
> 以下 URL 中需要将 ```LOCAL_USER_NAME``` 替换为本地(登录)用户的用户名

```
http://127.0.0.1:7000/chat/<LOCAL_USER_NAME>
```
