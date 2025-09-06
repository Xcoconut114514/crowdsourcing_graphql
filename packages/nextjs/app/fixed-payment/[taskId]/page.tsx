"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AddWorker } from "./_components/AddWorker";
import { ApproveProof } from "./_components/ApproveProof";
import { CancelTask } from "./_components/CancelTask";
import { ClaimReward } from "./_components/ClaimReward";
import { DisputeButton } from "./_components/DisputeButton";
import { ExtendDeadline } from "./_components/ExtendDeadline";
import { IncreaseReward } from "./_components/IncreaseReward";
import { ProofOfWork } from "./_components/ProofOfWork";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";
import { getBuiltGraphSDK } from "~~/.graphclient";
import { Address } from "~~/components/scaffold-eth";

const FixedPaymentTaskDetailPage = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const { address: connectedAddress } = useAccount();

  // 控制工作量证明模态框的显示状态
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [task, setTask] = useState<any>(null);
  const [taskData, setTaskData] = useState<any>(null);
  const [taskProof, setTaskProof] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 提取处理任务数据的函数，避免重复代码
  const processTaskData = useCallback((taskObj: any) => {
    // 设置taskData格式以匹配组件期望的格式
    setTaskData([
      BigInt(taskObj.taskId || 0),
      BigInt(taskObj.reward || 0),
      BigInt(taskObj.deadline || 0),
      getStatusValue(taskObj.status),
      taskObj.creator?.address || "",
      taskObj.worker?.address || "",
    ]);

    // 设置taskProof格式以匹配组件期望的格式
    if (taskObj.proofOfWork) {
      setTaskProof([
        true,
        taskObj.status === "Completed" || taskObj.status === "Paid",
        taskObj.updatedAt,
        taskObj.proofOfWork,
      ]);
    }
  }, []);

  const fetchTaskData = useCallback(async () => {
    if (!taskId) {
      setError("任务ID无效");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // 将sdk的创建移到函数内部，避免因对象引用变化导致的无限循环
      const sdk = getBuiltGraphSDK();

      // 从 GraphQL 获取任务详情
      const taskResult = await sdk.GetFixedPaymentTask({
        id: taskId as string,
      });

      if (taskResult?.fixedPaymentTask) {
        setTask(taskResult.fixedPaymentTask);
        processTaskData(taskResult.fixedPaymentTask);
      } else {
        setError("任务未找到");
      }
    } catch (err) {
      console.error("Error fetching task data:", err);
      setError("获取任务数据时出错");
    } finally {
      setIsLoading(false);
    }
  }, [taskId, processTaskData]); // 移除sdk依赖以避免无限循环

  useEffect(() => {
    fetchTaskData();
  }, [taskId, fetchTaskData]);

  const refetchTask = async () => {
    // 重新获取任务数据
    try {
      // 将sdk的创建移到函数内部，避免因对象引用变化导致的无限循环
      const sdk = getBuiltGraphSDK();

      // 从 GraphQL 获取任务详情
      const taskResult = await sdk.GetFixedPaymentTask({
        id: taskId as string,
      });

      if (taskResult?.fixedPaymentTask) {
        setTask(taskResult.fixedPaymentTask);
        processTaskData(taskResult.fixedPaymentTask);
      }
    } catch (error) {
      console.error("Error fetching task data:", error);
    }
  };

  const formatDeadline = (deadline: string) => {
    const date = new Date(Number(deadline) * 1000);
    return date.toLocaleString();
  };

  const formatCreatedAt = (createdAt: string) => {
    const date = new Date(Number(createdAt) * 1000);
    return date.toLocaleString();
  };

  const getStatusValue = (status: string) => {
    switch (status) {
      case "Open":
        return 0;
      case "InProgress":
        return 1;
      case "Completed":
        return 2;
      case "Paid":
        return 3;
      case "Cancelled":
        return 4;
      default:
        return 0;
    }
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
          <Link href="/fixed-payment" className="btn btn-primary">
            返回任务列表
          </Link>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center pt-10">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">任务未找到</h2>
          <Link href="/fixed-payment" className="btn btn-primary">
            返回任务列表
          </Link>
        </div>
      </div>
    );
  }

  // 解构任务数据
  const { id, creator, worker, title, description, reward, deadline, status, createdAt, proofOfWork, updatedAt } = task;

  // 检查当前用户是否为任务创建者
  const isTaskCreator =
    connectedAddress && creator && creator?.address && connectedAddress.toLowerCase() === creator.address.toLowerCase();

  // 获取工作者地址
  const taskWorker = worker?.address;

  return (
    <div className="flex flex-col items-center pt-10 px-2 min-h-screen bg-gradient-to-br from-base-200 to-base-100">
      <div className="w-full max-w-4xl space-y-8">
        <div className="flex justify-between items-center">
          <Link href="/fixed-payment" className="btn btn-sm btn-outline">
            ← 返回任务列表
          </Link>
          <div className="flex gap-2">
            {/* 只有任务创建者且任务不是已取消或已支付状态时才显示取消任务按钮 */}
            {isTaskCreator && status !== "Cancelled" && status !== "Paid" && (
              <CancelTask
                taskId={taskId as string}
                taskStatus={getStatusValue(status)}
                taskData={taskData}
                taskProof={taskProof}
                disputeProcessingRewardBps={BigInt(50)} // 使用默认值
                onSuccess={refetchTask}
              />
            )}
            {/* 只有工作者且任务状态为InProgress时才显示提交工作量证明按钮 */}
            {status === "InProgress" &&
              taskWorker &&
              connectedAddress &&
              taskWorker.toLowerCase() === connectedAddress.toLowerCase() && (
                <button className="btn btn-primary" onClick={() => setIsProofModalOpen(true)}>
                  提交工作量证明
                </button>
              )}
            {/* 只有工作者且任务状态为Completed时才能申领报酬 */}
            {connectedAddress &&
              taskWorker &&
              connectedAddress.toLowerCase() === taskWorker.toLowerCase() &&
              status === "Completed" && <ClaimReward taskId={taskId as string} onSuccess={refetchTask} />}
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
                  <div className="font-mono text-lg">#{id?.toString()}</div>
                </div>
                <div className="bg-base-200 rounded-xl p-3 w-full">
                  <div className="text-xs text-gray-500">创建时间</div>
                  <div className="font-semibold">{createdAt ? formatCreatedAt(createdAt) : "N/A"}</div>
                </div>
                <div className="bg-base-200 rounded-xl p-3 w-full">
                  <div className="text-xs text-gray-500">截止时间</div>
                  <div className="font-semibold">{deadline ? formatDeadline(deadline) : "N/A"}</div>
                </div>
                <div className="bg-base-200 rounded-xl p-3 w-full">
                  <div className="text-xs text-gray-500">任务报酬</div>
                  <div className="font-semibold">{reward ? formatUnits(BigInt(reward), 18) : "0"} TST</div>
                </div>
                <div className="bg-base-200 rounded-xl p-3 w-full">
                  <div className="text-xs text-gray-500">任务创建者</div>
                  {creator?.address ? <Address address={creator.address} /> : <div>N/A</div>}
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

        {/* 操作区：添加工作者 */}
        {isTaskCreator && status === "Open" && (
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[220px]">
              <AddWorker taskId={taskId as string} onSuccess={refetchTask} />
            </div>
          </div>
        )}

        {/* 工作量证明提交模态框 */}
        {status === "InProgress" && taskWorker && (
          <ProofOfWork
            taskId={taskId as string}
            taskDeadline={BigInt(deadline || 0)}
            isOpen={isProofModalOpen}
            onClose={() => setIsProofModalOpen(false)}
            onSuccess={refetchTask}
          />
        )}

        {/* 显示已提交的工作量证明 */}
        {proofOfWork && (
          <div className="card bg-base-100 shadow border border-base-300 rounded-2xl">
            <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="card-title text-xl font-bold mb-2">工作量证明</h2>
                <div className="form-control mt-2">
                  <label className="label">
                    <span className="label-text">提交时间</span>
                  </label>
                  <p className="font-mono">{updatedAt ? new Date(Number(updatedAt) * 1000).toLocaleString() : "N/A"}</p>
                </div>
                <div className="form-control mt-4">
                  <label className="label">
                    <span className="label-text">证明内容</span>
                  </label>
                  <div className="p-4 bg-base-200 rounded-lg text-base">
                    <p>{proofOfWork}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-4 justify-center items-end">
                <div className="form-control mt-4">
                  <label className="label">
                    <span className="label-text">状态</span>
                  </label>
                  <p className="font-semibold">{status === "Completed" || status === "Paid" ? "已批准" : "待批准"}</p>
                </div>
                {/* 只有任务创建者且工作量证明尚未批准时才显示批准按钮 */}
                {isTaskCreator &&
                  status !== "Completed" &&
                  status !== "Paid" &&
                  status === "InProgress" &&
                  taskWorker && <ApproveProof taskId={taskId as string} onSuccess={refetchTask} />}
                {/* 只有工作者且工作量证明尚未批准时才显示提出纠纷按钮 */}
                {connectedAddress &&
                  taskWorker &&
                  connectedAddress.toLowerCase() === taskWorker.toLowerCase() &&
                  status !== "Completed" &&
                  status !== "Paid" &&
                  status === "InProgress" && (
                    <DisputeButton
                      taskId={taskId as string}
                      taskData={taskData}
                      taskProof={taskProof}
                      disputeProcessingRewardBps={BigInt(50)} // 使用默认值
                      onSuccess={refetchTask}
                    />
                  )}
              </div>
            </div>
          </div>
        )}

        {/* 操作区：延长截止日期和增加奖励同一行 */}
        {isTaskCreator && (status === "Open" || status === "InProgress" || status === "Completed") && (
          <div className="flex flex-wrap gap-4 mt-2">
            <div className="flex-1 min-w-[220px]">
              <ExtendDeadline
                taskId={taskId as string}
                currentDeadline={BigInt(deadline || 0)}
                task={taskData}
                onSuccess={refetchTask}
              />
            </div>
            <div className="flex-1 min-w-[220px]">
              <IncreaseReward
                taskId={taskId as string}
                task={taskData}
                userTokenBalance={undefined}
                onSuccess={refetchTask}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FixedPaymentTaskDetailPage;
