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

3. 运行项目
```bash
go run .
```

## API

### 添加/更新命令
- 方法：POST
- 路径：/api/admin/command

请求体：
```json
{
    "command": {
        "command": "ping {{.target}}",
        "params": [
            {
                "name": "target",
                "description": "Ping 指定的主机，直到停止。",
                "defaultValue": "",
                "required": true,
                "type": "string"
            }
        ],
        "envs": [{
            "name": "USERNAME",
            "value": "root"
        }]
    },
    "name": "ping",
    "description": "Ping 指定的主机，直到停止。",
    "status": 0,
    "path":"/api/run/ping"
}
```
#### 请求体字段描述

```name```: 命令名称, 不能重复。

```description```: 命令描述。

```status```: 命令状态。0: 可用。1：不可用。

```path```: 命令的api路径

```command.command```
- 描述：用于指定要执行的命令，支持使用 Go 模板进行渲染。模板中可以包含 params 中定义的变量，以便动态生成命令。
- 示例：假设有一个参数 target，其值为 example，则模板 dir {{.target}} 将被渲染为 dir example。
- 注意事项：确保命令模板中的变量在 params 中有定义，否则模板渲染可能会失败。

```command.params``` 

描述：参数定义

- name: 参数名称
- description: 参数描述
- defaultValue: 默认值
- required: 是否必填
- type: 参数类型. string|int|bool


```command.envs```

描述：环境变量定义
- name: 环境变量名称
- value: 环境变量值

#### 响应

- 状态码：200
- 描述：命令添加成功

### 删除命令
- 方法：DELETE
- 路径：/api/admin/command

查询参数：
- ```name```: 要删除的命令，多个命令命令使用逗号分隔。

#### 响应

- 状态码：400
- 描述：参数错误

### 查询命令列表
- 方法：GET
- 路径：/api/admin/commands

#### 响应

- 状态码：400
- 描述：参数错误


- 状态码：200
```json
[
    {
        "id": 2,
        "command": {
            "command": "ping -n {{.c}} {{.t}}",
            "params": [
                {
                    "name": "c",
                    "description": "count",
                    "type": "int",
                    "defaultValue": "12",
                    "required": true
                },
                {
                    "name": "t",
                    "description": "Unscoped",
                    "type": "string",
                    "defaultValue": "",
                    "required": true
                }
            ],
            "env": [
                {
                    "name": "SET_ENV",
                    "value": "123"
                }
            ]
        },
        "name": "ping",
        "status": 0,
        "description": "Ping 指定的主机，直到停止。",
        "path": "/api/run/ping",
        "created_at": "2024-04-15T12:35:52.7077667+08:00",
        "updated_at": "2024-04-15T12:35:52.7077667+08:00"
    }
]
```


### 运行命令
- 类型：POST
- 路径：/api/run/

请求参数：
```json
{
    "name":"ping",
    "params":[
        {"name":"target","value":"baidu.com"}
    ],
    "env":[
        {
            "name": "PATH",
            "value": "/usr/bin/" 
        }
    ]
}
```


#### 响应

- 状态码：200
- 响应内容

```json
{
    "stdout": "", 
    "stderr": "",
    "error": ""
}
```

- ```stdout```: 标准输出
- ```stderr```: 标准错误
- ```error```: 错误信息