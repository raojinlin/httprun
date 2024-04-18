# httprun
httprun是一个基于HTTP API的Shell命令API网关，可以将内部的Shell脚本通过HTTP API的形式向外部开放，方便外部人员调用，而无需登录到服务器。

## 特性
- 自定义上传参数：支持自定义上传参数，使调用者可以根据需要传递不同的参数给Shell脚本。
- 接口鉴权：支持接口鉴权机制，确保只有经过授权的用户才能调用Shell脚本。
- 自定义命令执行：可以自定义要执行的Shell命令，灵活适应不同的需求。
- WEB UI：提供Web界面，方便通过图形化界面管理和调用Shell脚本。
- RESTful接口：提供符合RESTful设计风格的接口，方便通过编程方式调用Shell脚本。

## 安装与运行
1. 克隆本项目
```bash
git clone https://github.com/raojinlin/httprun
```

3. 运行项目
```bash
go run .
```

4. 创建 Admin API Token
```bash
$ go run ./cmd/httprun-admin/main.go
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbiI6dHJ1ZSwiZXhwIjoxNzE1OTk0NTQyLCJpYXQiOjE3MTM0MDI1NDIsIm5hbWUiOiJhZG1pbiIsInN1YiI6ImFkbWluIn0.Dq3j-hH2axl-KqKSqROTNvIGWlL-ZtOHQ4Ma2o1P9jw
```
该命令会创建一个admin权限的API Token

## 环境变量
```dotenv
# JWT token secret
JWT_SECRET=<YOUR_JWT_SECRET>
# Webapp build directory
WEBAPP_BUILD_DIR=./webapp/build
```

5. 在浏览器访问 [http://127.0.0.1:8081/admin](http://127.0.0.1:8081/admin)
6. 输入第4步生成的token

## 使用
### 创建命令
1. 设置命令名称（唯一）
2. 添加描述
3. 添加命令内容
    - 描述：用于指定要执行的命令，支持使用 Go 模板进行渲染。模板中可以包含 params 中定义的变量，以便动态生成命令。
    - 示例：假设有一个参数 target和count，其值为 example.com和4，则模板 ```ping {{.target}} -c {{.count}}``` 将被渲染为 ```ping example.com -c 4```。
    - 注意事项：确保命令模板中的变量在 params 中有定义，否则模板渲染可能会失败。
4. 添加命令参数
5. 添加环境变量
6. 点击创建命令

![alt text](./snapshots/image.png)

### 运行命令
1. 进入命令管理页面
2. 选择要运行的命令，点击【运行命令】


### 添加Token
为每个用户设置API Token。控制用户可以访问哪些命令。
1. 进入Token管理页面
2. 点击添加Token按钮
3. 设置用户名
4. 选择用户可以访问的命令
5. 设置token过期时间
6. 点击创建Token
7. 将Token分发给用户

![alt text](./snapshots/image-1.png)
## API文档
[Swagger Docs](http://127.0.0.1:8081/swagger/index.html)