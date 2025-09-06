"use client";

import { useState } from "react";
import { useEffect as useReactEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ApproveProofOfWork } from "./_components/ApproveProofOfWork";
import { CancelTask } from "./_components/CancelTask";
import { ClaimReward } from "./_components/ClaimReward";
import { DisputeButton } from "./_components/DisputeButton";
import { ExtendDeadline } from "./_components/ExtendDeadline";
import { IncreaseReward } from "./_components/IncreaseReward";
import { SubmitBid } from "./_components/SubmitBid";
import { SubmitProofOfWork } from "./_components/SubmitProofOfWork";
import { useAccount } from "wagmi";
import { getBuiltGraphSDK } from "~~/.graphclient";
import { Address } from "~~/components/scaffold-eth";

export default function BiddingTaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const { address: connectedAddress } = useAccount();
  const [taskData, setTaskData] = useState<any>(null);
  const [taskWorker, setTaskWorker] = useState<string>("");
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [taskProof, setTaskProof] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sdk = getBuiltGraphSDK();

  // 将任务状态字符串转换为数值
  const getStatusValue = (status: string) => {
    switch (status) {
      case "Open":
        return "Open";
      case "InProgress":
        return "InProgress";
      case "Completed":
        return "Completed";
      case "Paid":
        return "Paid";
      case "Cancelled":
        return "Cancelled";
      default:
        return "Open";
    }
  };

  // 获取任务详情
  useReactEffect(() => {
    const fetchTaskData = async () => {
      if (!taskId) return;

      try {
        setIsLoading(true);
        setError(null);

        // 从 GraphQL 获取任务详情
        const taskResult = await sdk.GetBiddingTask({
          id: taskId,
        });

        if (taskResult?.biddingTask) {
          const task = taskResult.biddingTask;
          // 设置taskData格式以匹配组件期望的格式，与FixedPaymentTask保持一致
          setTaskData({
            id: task.taskId || 0,
            reward: task.reward || 0,
            deadline: task.deadline || 0,
            status: getStatusValue(task.status),
            creator: task.creator?.address || "",
            worker: task.worker?.address || "",
            title: task.title,
            description: task.description,
            createdAt: task.createdAt,
          });

          if (task.worker?.address) {
            setTaskWorker(task.worker.address);
          }

          if (task.proofOfWork) {
            // 构造taskProof对象，格式与原来保持一致
            // [proof, approved, submittedAt, worker]
            setTaskProof([
              task.proofOfWork,
              task.status === "Completed" || task.status === "Paid",
              task.updatedAt,
              task.worker?.address || "",
            ]);
          } else {
            // 如果没有工作量证明，则设置为空数组
            setTaskProof(undefined);
          }
        } else {
          setError("任务未找到");
        }
      } catch (err) {
        console.error("Error fetching task data:", err);
        setError("获取任务数据时出错");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTaskData();
  }, [taskId]);

  const refetchTask = async () => {
    // 重新获取任务数据
    try {
      // 从 GraphQL 获取任务详情
      const taskResult = await sdk.GetBiddingTask({
        id: taskId as string,
      });

      if (taskResult?.biddingTask) {
        const task = taskResult.biddingTask;
        setTaskData({
          id: task.taskId,
          creator: task.creator.address,
          title: task.title,
          description: task.description,
          totalreward: task.reward,
          deadline: task.deadline,
          status: task.status,
          createdAt: task.createdAt,
        });

        if (task.worker?.address) {
          setTaskWorker(task.worker.address);
        }

        if (task.proofOfWork) {
          // 构造taskProof对象，格式与原来保持一致
          // [proof, approved, submittedAt, worker]
          setTaskProof([
            task.proofOfWork,
            task.status === "Completed" || task.status === "Paid",
            task.updatedAt,
            task.worker?.address || "",
          ]);
        }
      }
    } catch (error) {
      console.error("Error fetching task data:", error);
    }
  };

  const formatDeadline = (deadline: string) => {
    if (!deadline) return "N/A";
    const date = new Date(Number(deadline) * 1000);
    return date.toLocaleString();
  };

  const formatCreatedAt = (createdAt: string) => {
    if (!createdAt) return "N/A";
    const date = new Date(Number(createdAt) * 1000);
    return date.toLocaleString();
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "Open":
        return "Open";
      case "InProgress":
        return "InProgress";
      case "Completed":
        return "Completed";
      case "Paid":
        return "Paid";
      case "Cancelled":
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open": // Open
        return "badge-success";
      case "InProgress": // InProgress
        return "badge-warning";
      case "Completed": // Completed
        return "badge-info";
      case "Paid": // Paid
        return "badge-primary";
      case "Cancelled": // Cancelled
        return "badge-error";
      default:
        return "badge-ghost";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center pt-10">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center pt-10">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{error}</h2>
          <Link href="/bidding" className="btn btn-primary">
            返回任务列表
          </Link>
        </div>
      </div>
    );
  }

  if (!taskData) {
    return (
      <div className="flex items-center justify-center pt-10">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">任务未找到</h2>
          <Link href="/bidding" className="btn btn-primary">
            返回任务列表
          </Link>
        </div>
      </div>
    );
  }

  // 解构任务数据
  const { id, creator, title, description, totalreward, deadline, status, createdAt } = taskData;

  // 检查当前用户是否为任务创建者
  const isTaskCreator = connectedAddress && creator && connectedAddress.toLowerCase() === creator.toLowerCase();
  const isTaskOpen = status === "Open";
  const isTaskInProgress = status === "InProgress";
  const isTaskCompleted = status === "Completed";
  const isTaskCancelled = status === "Cancelled";
  const isTaskPaid = status === "Paid";
  const hasWorker = taskWorker && taskWorker !== "0x0000000000000000000000000000000000000000";
  const isTaskWorker = connectedAddress && taskWorker && connectedAddress.toLowerCase() === taskWorker.toLowerCase();

  return (
    <div className="flex flex-col items-center pt-10 px-2 min-h-screen bg-gradient-to-br from-base-200 to-base-100">
      <div className="w-full max-w-4xl space-y-8">
        <div className="flex justify-between items-center">
          <Link href="/bidding" className="btn btn-sm btn-outline">
            ← 返回任务列表
          </Link>
          <div className="flex gap-2">
            {/* 查看竞标者列表按钮 */}
            {isTaskCreator && isTaskOpen && !hasWorker && (
              <Link href={`/bidding/${taskId}/BidPage`} className="btn btn-primary btn-sm">
                查看竞标者列表
              </Link>
            )}
            {/* 取消任务按钮 */}
            {isTaskCreator && !isTaskCancelled && !isTaskPaid && (
              <CancelTask
                taskId={taskId}
                taskStatus={isTaskOpen ? 0 : 1}
                taskData={taskData}
                taskProof={taskProof}
                disputeProcessingRewardBps={undefined}
                onSuccess={refetchTask}
              />
            )}
            {/* 只有工作者且任务状态为InProgress时才显示提交工作量证明按钮 */}
            {isTaskInProgress && hasWorker && isTaskWorker && (
              <button className="btn btn-primary btn-sm" onClick={() => setIsProofModalOpen(true)}>
                提交工作量证明
              </button>
            )}
            {/* 只有工作者且任务状态为Completed时才能申领报酬 */}
            {isTaskWorker && isTaskCompleted && <ClaimReward taskId={taskId} onSuccess={refetchTask} />}
          </div>
        </div>

        {/* 任务详情卡片 */}
        <div className="card bg-base-100 shadow-2xl border border-base-300 rounded-3xl">
          <div className="card-body">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="flex-1">
                <h1 className="card-title text-3xl font-bold mb-2 text-primary">{title}</h1>
                <span className={`badge ${getStatusColor(status)} badge-lg text-base mt-2`}>
                  {getStatusText(status)}
                </span>
                <div className="mt-4 bg-base-200 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">任务描述</p>
                  <p className="mt-1 text-base leading-relaxed">{description}</p>
                </div>
              </div>
              <div className="flex flex-col gap-4 min-w-[180px] items-end">
                <div className="bg-base-200 rounded-xl p-3 w-full">
                  <div className="text-xs text-gray-500">任务ID</div>
                  <div className="font-mono text-lg">#{id?.toString() || "N/A"}</div>
                </div>
                <div className="bg-base-200 rounded-xl p-3 w-full">
                  <div className="text-xs text-gray-500">创建时间</div>
                  <div className="font-semibold">{formatCreatedAt(createdAt)}</div>
                </div>
                <div className="bg-base-200 rounded-xl p-3 w-full">
                  <div className="text-xs text-gray-500">截止时间</div>
                  <div className="font-semibold">{formatDeadline(deadline)}</div>
                </div>
                <div className="bg-base-200 rounded-xl p-3 w-full">
                  <div className="text-xs text-gray-500">任务报酬</div>
                  <div className="font-semibold">
                    {totalreward ? (Number(totalreward.toString()) / 1e18).toFixed(2) : "0.00"} TST
                  </div>
                </div>
                <div className="bg-base-200 rounded-xl p-3 w-full">
                  <div className="text-xs text-gray-500">任务创建者</div>
                  <Address address={creator} />
                </div>
                {taskWorker && (
                  <div className="bg-base-200 rounded-xl p-3 w-full">
                    <div className="text-xs text-gray-500">工作者</div>
                    <Address address={taskWorker} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 根据用户角色和任务状态显示不同内容 */}
        {isTaskCreator ? (
          <>
            {/* 操作区：延长截止日期和增加奖励同一行 */}
            {(status === "Open" || status === "InProgress" || status === "Completed") && (
              <div className="flex flex-wrap gap-4 mt-2">
                <div className="flex-1 min-w-[220px]">
                  <ExtendDeadline
                    taskId={taskId}
                    currentDeadline={deadline}
                    taskCreator={creator}
                    onSuccess={refetchTask}
                  />
                </div>
                <div className="flex-1 min-w-[220px]">
                  <IncreaseReward taskId={taskId} taskCreator={creator} onSuccess={refetchTask} />
                </div>
              </div>
            )}
          </>
        ) : (
          // 工作者视图
          <>
            {isTaskOpen && (
              <div className="card bg-base-100 shadow-xl mb-6">
                <div className="card-body">
                  <SubmitBid taskId={BigInt(taskId)} isTaskOpen={isTaskOpen} />
                </div>
              </div>
            )}

            {/* 工作量证明提交模态框 */}
            {isTaskInProgress && hasWorker && isTaskWorker && (
              <SubmitProofOfWork
                taskId={BigInt(taskId)}
                taskDeadline={deadline}
                isOpen={isProofModalOpen}
                onClose={() => setIsProofModalOpen(false)}
                onSuccess={() => {
                  refetchTask();
                  setIsProofModalOpen(false);
                }}
              />
            )}
          </>
        )}

        {/* 显示已提交的工作量证明 */}
        {taskProof && taskProof[0] && (
          <div className="card bg-base-100 shadow border border-base-300 rounded-2xl">
            <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="card-title text-xl font-bold mb-2">工作量证明</h2>
                <div className="form-control mt-2">
                  <label className="label">
                    <span className="label-text">提交时间</span>
                  </label>
                  <p className="font-mono">{new Date(Number(taskProof[2]) * 1000).toLocaleString()}</p>
                </div>
                <div className="form-control mt-4">
                  <label className="label">
                    <span className="label-text">证明内容</span>
                  </label>
                  <div className="p-4 bg-base-200 rounded-lg text-base">
                    <p>{taskProof[0]}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-4 justify-center items-end">
                <div className="form-control mt-4">
                  <label className="label">
                    <span className="label-text">状态</span>
                  </label>
                  <p className="font-semibold">{taskProof[1] ? "已批准" : "待批准"}</p>
                </div>

                {/* 只有任务创建者且工作量证明尚未批准时才显示批准按钮 */}
                {isTaskCreator && !taskProof[1] && isTaskInProgress && hasWorker && (
                  <ApproveProofOfWork
                    taskId={BigInt(taskId)}
                    taskWorker={taskWorker}
                    isTaskCreator={isTaskCreator}
                    isTaskInProgress={isTaskInProgress}
                  />
                )}

                {/* 只有工作者且工作量证明尚未批准时才显示提出纠纷按钮 */}
                {isTaskWorker && !taskProof[1] && isTaskInProgress && (
                  <DisputeButton
                    taskId={taskId}
                    taskProof={taskProof}
                    taskData={[undefined, totalreward]}
                    disputeProcessingRewardBps={undefined}
                    onSuccess={refetchTask}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
