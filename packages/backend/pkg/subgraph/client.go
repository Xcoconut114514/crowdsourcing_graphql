package subgraph

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

type Client struct {
	url        string
	httpClient *http.Client
}

func NewClient(url string) *Client {
	return &Client{
		url: url,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

type GraphQLRequest struct {
	Query     string                 `json:"query"`
	Variables map[string]interface{} `json:"variables,omitempty"`
}

type GraphQLResponse struct {
	Data   json.RawMessage `json:"data"`
	Errors []GraphQLError  `json:"errors,omitempty"`
}

type GraphQLError struct {
	Message string `json:"message"`
}

func (c *Client) Query(ctx context.Context, query string, variables map[string]interface{}, result interface{}) error {
	reqBody := GraphQLRequest{
		Query:     query,
		Variables: variables,
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", c.url, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to execute request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("failed to read response: %w", err)
	}

	var graphQLResp GraphQLResponse
	if err := json.Unmarshal(body, &graphQLResp); err != nil {
		return fmt.Errorf("failed to unmarshal response: %w", err)
	}

	if len(graphQLResp.Errors) > 0 {
		return fmt.Errorf("graphql errors: %v", graphQLResp.Errors)
	}

	if err := json.Unmarshal(graphQLResp.Data, result); err != nil {
		return fmt.Errorf("failed to unmarshal data: %w", err)
	}

	return nil
}

// GetUserWorkSummary 获取用户工作摘要
func (c *Client) GetUserWorkSummary(ctx context.Context, userID string) (*UserWorkSummary, error) {
	query := `
        query GetUserWorkSummary($id: ID!) {
            user(id: $id) {
                id
                address
                assignedTasks {
                    id
                    taskId
                    title
                    reward
                    deadline
                    status
                    createdAt
                    updatedAt
                }
                biddingTaskAssigned {
                    id
                    taskId
                    title
                    reward
                    deadline
                    status
                    createdAt
                    updatedAt
                }
                milestonePaymentTaskAssigned {
                    id
                    taskId
                    title
                    reward
                    deadline
                    status
                    completedMilestonesCount
                    createdAt
                    updatedAt
                }
                createdTasks {
                    id
                    taskId
                    status
                    reward
                }
                biddingTaskCreated {
                    id
                    taskId
                    status
                    reward
                }
                milestonePaymentTaskCreated {
                    id
                    taskId
                    status
                    reward
                }
                workerDisputes {
                    id
                    disputeId
                    taskId
                    rewardAmount
                    workerShare
                    status
                    votes {
                        admin {
                            stakeAmount
                        }
                        workerShare
                    }
                    createdAt
                }
                creatorDisputes {
                    id
                    disputeId
                    taskId
                    rewardAmount
                    workerShare
                    status
                    createdAt
                }
                bids {
                    id
                    taskId
                    amount
                    estimatedTime
                    createdAt
                }
            }
        }
    `

	variables := map[string]interface{}{
		"id": userID,
	}

	var result struct {
		User UserWorkSummary `json:"user"`
	}

	if err := c.Query(ctx, query, variables, &result); err != nil {
		return nil, err
	}

	return &result.User, nil
}

// 数据结构定义
type UserWorkSummary struct {
	ID                           string          `json:"id"`
	Address                      string          `json:"address"`
	AssignedTasks                []Task          `json:"assignedTasks"`
	BiddingTaskAssigned          []Task          `json:"biddingTaskAssigned"`
	MilestonePaymentTaskAssigned []MilestoneTask `json:"milestonePaymentTaskAssigned"`
	CreatedTasks                 []TaskSimple    `json:"createdTasks"`
	BiddingTaskCreated           []TaskSimple    `json:"biddingTaskCreated"`
	MilestonePaymentTaskCreated  []TaskSimple    `json:"milestonePaymentTaskCreated"`
	WorkerDisputes               []Dispute       `json:"workerDisputes"`
	CreatorDisputes              []Dispute       `json:"creatorDisputes"`
	Bids                         []Bid           `json:"bids"`
}

type Task struct {
	ID        string `json:"id"`
	TaskID    string `json:"taskId"`
	Title     string `json:"title"`
	Reward    string `json:"reward"`
	Deadline  string `json:"deadline"`
	Status    string `json:"status"`
	CreatedAt string `json:"createdAt"`
	UpdatedAt string `json:"updated At"`
}

type MilestoneTask struct {
	Task
	CompletedMilestonesCount string `json:"completedMilestonesCount"`
}

type TaskSimple struct {
	ID     string `json:"id"`
	TaskID string `json:"taskId"`
	Status string `json:"status"`
	Reward string `json:"reward"`
}

type Dispute struct {
	ID           string      `json:"id"`
	DisputeID    string      `json:"disputeId"`
	TaskID       string      `json:"taskId"`
	RewardAmount string      `json:"rewardAmount"`
	WorkerShare  string      `json:"workerShare"`
	Status       string      `json:"status"`
	Votes        []AdminVote `json:"votes"`
	CreatedAt    string      `json:"createdAt"`
}

type AdminVote struct {
	Admin       Admin  `json:"admin"`
	WorkerShare string `json:"workerShare"`
}

type Admin struct {
	StakeAmount string `json:"stakeAmount"`
}

type Bid struct {
	ID            string `json:"id"`
	TaskID        string `json:"taskId"`
	Amount        string `json:"amount"`
	EstimatedTime string `json:"estimatedTime"`
	CreatedAt     string `json:"createdAt"`
}
