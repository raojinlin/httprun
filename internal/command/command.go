package command

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"html/template"
	"log"
	"os"
	"os/exec"
	"reflect"

	"github.com/google/shlex"
)

type ParamDefine struct {
	Name         string      `json:"name" yaml:"name"`
	Description  string      `json:"description" yaml:"description"`
	Type         string      `json:"type" yaml:"type"`
	DefaultValue interface{} `json:"defaultValue" yaml:"defaultValue"`
	Required     bool        `json:"required" yaml:"required"`
}

type Param struct {
	Name  string      `json:"name" yaml:"name"`
	Value interface{} `json:"value" yaml:"value"`
}

type Env struct {
	Name  string `json:"name" yaml:"name"`
	Value string `json:"value" yaml:"value"`
}

type Command struct {
	Command string        `json:"command" yaml:"command"`
	Params  []ParamDefine `json:"params" yaml:"params"`
	Env     []Env         `json:"env" yaml:"env"`
}

func NewCommand(cmd string) *Command {
	return &Command{Command: cmd, Params: make([]ParamDefine, 0), Env: make([]Env, 0)}
}

func (c *Command) SetEnv(name string, value string) *Command {
	envExists := false
	for _, env := range c.Env {
		if env.Name == name {
			env.Value = value
			envExists = true
		}
	}

	if !envExists {
		c.Env = append(c.Env, Env{Name: name, Value: value})
	}

	return c
}

func (c *Command) lookupParamDefine(name string) *ParamDefine {
	for _, param := range c.Params {
		if param.Name == name {
			return &param
		}
	}

	return nil
}

func (c *Command) isParamValueEmpty(param *Param) bool {
	if param.Value == nil {
		return true
	}

	switch param.Value.(type) {
	case string:
		return len(param.Value.(string)) == 0
	case int:
		return param.Value.(int) == 0
	case int64:
		return param.Value.(int64) == 0
	case float64:
		return param.Value.(float64) == 0
	default:
		return reflect.DeepEqual(param.Value, reflect.Zero(reflect.TypeOf(param.Value)).Interface())
	}
}

func (c *Command) checkParams(params []Param) error {
	for _, param := range params {
		define := c.lookupParamDefine(param.Name)
		if define == nil {
			return fmt.Errorf("invalid param: %s", param.Name)
		}

		if define.Required && c.isParamValueEmpty(&param) {
			return fmt.Errorf("param: %s value required", param.Name)
		}
	}

	return nil
}

func (c *Command) command(params []Param) (string, error) {
	var out bytes.Buffer
	data := map[string]any{}
	for _, paramDef := range c.Params {
		paramFind := false
		for _, param := range params {
			if param.Name == paramDef.Name {
				paramFind = true
				break
			}
		}

		if !paramFind {
			data[paramDef.Name] = paramDef.DefaultValue
		}
	}

	for _, param := range params {
		data[param.Name] = param.Value
		if c.isParamValueEmpty(&param) {
			paramDefine := c.lookupParamDefine(param.Name)
			data[param.Name] = paramDefine.DefaultValue
		}
	}

	tmpl, err := template.New("cmd").Parse(c.Command)
	if err != nil {
		return "", err
	}

	err = tmpl.Execute(&out, data)
	if err != nil {
		return "", err
	}

	return out.String(), nil
}

func (c *Command) Run(ctx context.Context, params []Param, env []Env) (string, string, error) {
	err := c.checkParams(params)
	if err != nil {
		return "", "", err
	}

	script, err := c.command(params)
	if err != nil {
		return "", "", err
	}

	parsed_cmd, err := shlex.Split(script)
	if err != nil {
		return "", "", err
	}

	log.Println("run cmd: ", script, parsed_cmd)
	cmd := exec.CommandContext(ctx, parsed_cmd[0], parsed_cmd[1:]...)
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	cmdEnv := os.Environ()
	c.Env = append(c.Env, env...)
	for _, env := range c.Env {
		cmdEnv = append(cmdEnv, fmt.Sprintf("%s=%s", env.Name, env.Value))
	}
	cmd.Env = cmdEnv

	err = cmd.Run()
	if err != nil {
		return "", stderr.String(), err
	}

	return stdout.String(), stderr.String(), nil
}

func (c *Command) JSON() (string, error) {
	data, err := json.Marshal(c)
	if err != nil {
		return "", err
	}

	return string(data), nil
}
