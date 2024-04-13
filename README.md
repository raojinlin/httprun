# httprun

httprun是一个基于HTTP API的Shell命令API网关，可以将内部的Shell脚本通过HTTP API的形式向外部开放，方便外部人员调用，而无需登录到服务器。

## 特性
- 接口路径自定义：可以自定义接口路径，使其符合公司的命名规范和安全需求。
- 自定义上传参数：支持自定义上传参数，使调用者可以根据需要传递不同的参数给Shell脚本。
- 接口鉴权：支持接口鉴权机制，确保只有经过授权的用户才能调用Shell脚本。
- 自定义命令执行：可以自定义要执行的Shell命令，灵活适应不同的需求。

## 安装与运行
1. 克隆本项目
```bash
git clone https://github.com/raojinlin/httprun
```
2. 安装依赖
```bash
go mod tidy
```

3. 运行项目
```bash
go run .
```