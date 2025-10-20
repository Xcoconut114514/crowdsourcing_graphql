package config

import (
	"github.com/spf13/viper"
)

type Config struct {
	Environment   string
	Port          int
	LogLevel      string
	Database      DatabaseConfig
	Redis         RedisConfig
	SubgraphURL   string
	BlockchainRPC string
	JWTSecret     string
	AI            AIConfig
}

type DatabaseConfig struct {
	Host     string
	Port     int
	User     string
	Password string
	DBName   string
	SSLMode  string
}

type RedisConfig struct {
	Host     string
	Port     int
	Password string
	DB       int
}

type AIConfig struct {
	PythonServiceURL string
	ModelPath        string
}

func Load() (*Config, error) {
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath(".")
	viper.AddConfigPath("./config")

	// 设置默认值
	viper.SetDefault("environment", "development")
	viper.SetDefault("port", 8080)
	viper.SetDefault("log_level", "info")

	// 环境变量覆盖
	viper.AutomaticEnv()

	if err := viper.ReadInConfig(); err != nil {
		return nil, err
	}

	var config Config
	if err := viper.Unmarshal(&config); err != nil {
		return nil, err
	}

	return &config, nil
}
