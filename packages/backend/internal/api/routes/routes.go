package routes

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"github.com/KamisAyaka/crowdsourcing_graphql/packages/backend/internal/api/handlers"
	"github.com/KamisAyaka/crowdsourcing_graphql/packages/backend/internal/api/middleware"
	"github.com/KamisAyaka/crowdsourcing_graphql/packages/backend/internal/config"
	"github.com/KamisAyaka/crowdsourcing_graphql/packages/backend/internal/repository/db"
	"github.com/KamisAyaka/crowdsourcing_graphql/packages/backend/internal/service/reputation"
	"github.com/KamisAyaka/crowdsourcing_graphql/packages/backend/pkg/cache"
	"github.com/KamisAyaka/crowdsourcing_graphql/packages/backend/pkg/subgraph"
)

func SetupRoutes(
	database *db.Database,
	redisCache *cache.RedisCache,
	subgraphClient *subgraph.Client,
	cfg *config.Config,
) *gin.Engine {
	router := gin.New()

	// 中间件
	router.Use(gin.Recovery())
	router.Use(middleware.Logger())
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "https://yourdomain.com"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// 初始化服务
	reputationService := reputation.NewService(
		database,
		redisCache,
		reputation.NewCalculator(subgraphClient),
	)

	// 初始化处理器
	reputationHandler := handlers.NewReputationHandler(reputationService)

	// 健康检查
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// API v1 路由组
	v1 := router.Group("/api/v1")
	{
		// 声誉评分相关路由
		reputation := v1.Group("/reputation")
		{
			reputation.GET("/score/:address", reputationHandler.GetUserScore)
			reputation.GET("/leaderboard", reputationHandler.GetLeaderboard)
			reputation.GET("/history/:address", reputationHandler.GetScoreHistory)
			reputation.POST("/calculate/:address", reputationHandler.CalculateScore)
			reputation.GET("/suggestions/:address", reputationHandler.GetImprovementSuggestions)
		}

		// 用户相关路由
		users := v1.Group("/users")
		{
			users.GET("/:address", reputationHandler.GetUserProfile)
			users.GET("/:address/stats", reputationHandler.GetUserStats)
		}

		// AI 分析相关路由 (未来扩展)
		ai := v1.Group("/ai")
		{
			ai.POST("/analyze/:address", reputationHandler.AnalyzeUser)
			ai.GET("/anomaly/:address", reputationHandler.GetAnomalyDetection)
		}
	}

	return router
}
