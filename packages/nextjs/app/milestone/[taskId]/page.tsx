"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AddMilestoneModal } from "./_components/AddMilestoneModal";
import { AddWorkerModal } from "./_components/AddWorkerModal";
import { CancelTask } from "./_components/CancelTask";
import { DisputeButton } from "./_components/DisputeButton";
import { ExtendDeadline } from "./_components/ExtendDeadline";
import { IncreaseReward } from "./_components/IncreaseReward";
import { MilestonesList } from "./_components/MilestonesList";
import { SubmitProofModal } from "./_components/SubmitProofModal";
import { TaskInfoCard } from "./_components/TaskInfoCard";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { getBuiltGraphSDK } from "~~/.graphclient";
import { useDeployedContractInfo, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const MilestoneTaskDetailPage = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const { address: connectedAddress } = useAccount();
  const [task, setTask] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isAddWorkerModalOpen, setIsAddWorkerModalOpen] = useState(false);
  const [isAddMilestoneModalOpen, setIsAddMilestoneModalOpen] = useState(false);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState<number | null>(null);

  // 获取MilestonePaymentTask合约信息
  const { data: milestonePaymentTaskContract } = useDeployedContractInfo({ contractName: "MilestonePaymentTask" });

  // 获取TaskToken合约地址
  const { data: taskTokenData } = useDeployedContractInfo({
    contractName: "TaskToken",
  });

  // 固定的纠纷处理奖励比例 (0.5%)
  const disputeProcessingRewardBps = BigInt(50);

  // 合约写入hooks
  const { writeContractAsync: approveMilestone } = useScaffoldWriteContract({
    contractName: "MilestonePaymentTask",
  });

  const { writeContractAsync: payMilestone } = useScaffoldWriteContract({
    contractName: "MilestonePaymentTask",
  });

  const { writeContractAsync: completeTask } = useScaffoldWriteContract({
    contractName: "MilestonePaymentTask",
  });

  const { writeContractAsync: addWorker } = useScaffoldWriteContract({ contractName: "MilestonePaymentTask" });
  const { writeContractAsync: approveToken } = useScaffoldWriteContract({ contractName: "TaskToken" });
  const { writeContractAsync: addMilestoneContract } = useScaffoldWriteContract({
    contractName: "MilestonePaymentTask",
  });

  const { writeContractAsync: submitMilestoneProofOfWork } = useScaffoldWriteContract({
    contractName: "MilestonePaymentTask",
  });

  // 获取任务详情
  const fetchTask = useCallback(async () => {
    try {
      setIsLoading(true);
      // 将sdk的创建移到函数内部，避免因对象引用变化导致的无限循环
      const sdk = getBuiltGraphSDK();
      const result = await sdk.GetMilestonePaymentTask({
        id: taskId as string,
      });

      if (result?.milestonePaymentTask) {
        setTask(result.milestonePaymentTask);
      }
    } catch (error) {
      console.error("Error fetching task:", error);
    } finally {
      setIsLoading(false);
    }
  }, [taskId]); // 移除sdk依赖以避免无限循环

  useEffect(() => {
    if (taskId) {
      fetchTask();
    }
  }, [taskId, fetchTask]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center pt-10">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center pt-10">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">任务未找到</h2>
          <Link href="/milestone" className="btn btn-primary">
            返回任务列表
          </Link>
        </div>
      </div>
    );
  }

  // 解构任务数据
  const { id, creator, title, description, totalReward, deadline, status, createdAt, worker, milestones } = task;

  // 检查当前用户是否为任务创建者
  const isTaskCreator = connectedAddress && creator && connectedAddress.toLowerCase() === creator.address.toLowerCase();
  const isTaskWorker = connectedAddress && worker && connectedAddress.toLowerCase() === worker.address.toLowerCase();

  // 检查任务状态
  const isTaskInProgress = status === "InProgress";

  // 处理各种操作
  const handleAddWorkerClick = () => {
    setIsAddWorkerModalOpen(true);
  };

  const handleAddMilestoneClick = () => {
    setIsAddMilestoneModalOpen(true);
  };

  const handleApproveMilestone = async (index: number) => {
    try {
      const result = await approveMilestone({
        functionName: "approveMilestone",
        args: [BigInt(taskId), BigInt(index)],
      });
      console.log("Approval transaction result:", result);
      fetchTask();
    } catch (e) {
      console.error("Error approving milestone:", e);
    }
  };

  const handlePayMilestone = async (index: number) => {
    try {
      const result = await payMilestone({
        functionName: "payMilestone",
        args: [BigInt(taskId), BigInt(index)],
      });
      console.log("Payment transaction result:", result);
      fetchTask();
    } catch (e) {
      console.error("Error claiming milestone reward:", e);
    }
  };

  const handleSubmitProof = (index: number) => {
    setSelectedMilestoneIndex(index);
    setIsProofModalOpen(true);
  };

  const handleCompleteTask = async () => {
    try {
      const result = await completeTask({
        functionName: "completeTask",
        args: [BigInt(taskId)],
      });
      console.log("Complete task transaction result:", result);
      fetchTask();
    } catch (e) {
      console.error("Error completing task:", e);
    }
  };

  // 处理添加工作者
  const handleAddWorker = async (workerAddress: string) => {
    try {
      // 添加工作者不再需要预先批准代币和支付费用
      const addWorkerResult = await addWorker({
        functionName: "addWorker",
        args: [BigInt(taskId), workerAddress],
      });

      console.log("Add worker transaction result:", addWorkerResult);

      fetchTask();
      setIsAddWorkerModalOpen(false);
    } catch (e) {
      console.error("Error adding worker:", e);
    }
  };

  // 处理添加里程碑
  const handleAddMilestone = async (description: string, reward: string) => {
    try {
      if (!milestonePaymentTaskContract || !taskTokenData) {
        alert("合约未部署或地址无效");
        return;
      }

      // 验证奖励金额
      if (!reward || isNaN(Number(reward)) || Number(reward) <= 0) {
        throw new Error("请输入有效的奖励金额");
      }

      const rewardInWei = parseEther(reward);

      // 批准代币转移给里程碑付款任务合约
      const approveResult = await approveToken({
        functionName: "approve",
        args: [milestonePaymentTaskContract.address, rewardInWei],
      });

      // 等待授权交易确认
      console.log("Approval transaction result:", approveResult);

      // 调用合约添加里程碑
      await addMilestoneContract({
        functionName: "addMilestone",
        args: [BigInt(taskId), description, rewardInWei],
      });

      // 刷新任务信息并关闭模态框
      fetchTask();
      setIsAddMilestoneModalOpen(false);
    } catch (e) {
      console.error("Error adding milestone:", e);
      // 这里可以添加更详细的错误处理，比如向用户显示错误信息
    }
  };

  // 处理提交工作量证明
  const handleSubmitMilestoneProof = async (proof: string) => {
    try {
      if (selectedMilestoneIndex === null) {
        alert("请选择一个里程碑");
        return;
      }

      await submitMilestoneProofOfWork({
        functionName: "submitMilestoneProofOfWork",
        args: [BigInt(taskId), BigInt(selectedMilestoneIndex), proof],
      });

      fetchTask();
      setIsProofModalOpen(false);
      setSelectedMilestoneIndex(null);
    } catch (e) {
      console.error("Error submitting proof:", e);
    }
  };

  // 构造taskData对象以匹配组件期望的格式
  // Task结构: [id, totalreward, deadline, status, creator, worker]
  const taskData = [
    BigInt(id || 0),
    BigInt(totalReward || 0),
    BigInt(deadline || 0),
    ["Open", "InProgress", "Completed", "Paid", "Cancelled"].indexOf(status),
    creator?.address || "",
    worker?.address || "",
  ];

  return (
    <div className="flex flex-col items-center pt-10 px-2 min-h-screen bg-gradient-to-br from-base-200 to-base-100">
      <div className="w-full max-w-4xl space-y-8">
        <div className="flex justify-between items-center">
          <Link href="/milestone" className="btn btn-sm btn-outline">
            ← 返回任务列表
          </Link>
          <div className="flex gap-2">
            {/* 只有任务创建者操作按钮 */}
            {isTaskCreator && (
              <>
                {/* 根据合约逻辑，只要任务不是已取消或已支付状态，任务创建者都可以取消任务 */}
                {taskData && taskData[4] !== 4 && taskData[4] !== 3 && (
                  <CancelTask
                    taskId={taskId}
                    isTaskCreator={!!isTaskCreator}
                    isTaskInProgress={isTaskInProgress}
                    taskData={taskData}
                    disputeProcessingRewardBps={disputeProcessingRewardBps}
                    onSuccess={fetchTask} // 添加 onSuccess 回调
                  />
                )}
                {/* 只有任务创建者且所有里程碑都已完成时才能完成任务 */}
                {isTaskInProgress && milestones.length > 0 && (
                  <button className="btn btn-primary btn-sm" onClick={handleCompleteTask}>
                    完成任务
                  </button>
                )}
                {/* 添加工作者按钮 - 仅当任务状态为Open且未分配工作者时显示 */}
                {status === "Open" && (
                  <button className="btn btn-primary btn-sm" onClick={handleAddWorkerClick}>
                    添加工作者
                  </button>
                )}
                {/* 添加里程碑按钮 - 仅当任务状态为InProgress时显示 */}
                {(status === "InProgress" || status === "Open") && (
                  <button className="btn btn-primary btn-sm" onClick={handleAddMilestoneClick}>
                    添加里程碑
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* 任务详情卡片 */}
        <TaskInfoCard
          task={{
            id: BigInt(id),
            creator: creator.address,
            title: title,
            description: description,
            totalreward: BigInt(totalReward),
            deadline: BigInt(deadline),
            status: ["Open", "InProgress", "Completed", "Paid", "Cancelled"].indexOf(status),
            createdAt: BigInt(createdAt),
          }}
          taskWorker={worker.address}
        />

        {/* 里程碑列表 */}
        {milestones.length > 0 && (
          <MilestonesList
            milestones={milestones.map((milestone: any, index: number) => ({
              ...milestone,
              // 添加纠纷按钮到每个里程碑
              actions:
                isTaskWorker && milestone.workProof?.submitted && !milestone.workProof?.approved ? (
                  <DisputeButton
                    taskId={taskId}
                    milestoneIndex={index}
                    taskData={taskData}
                    milestoneData={milestone}
                    disputeProcessingRewardBps={disputeProcessingRewardBps}
                    onSuccess={fetchTask}
                  />
                ) : null,
            }))}
            isTaskCreator={!!isTaskCreator}
            isTaskWorker={!!isTaskWorker}
            onApproveMilestone={handleApproveMilestone}
            onPayMilestone={handlePayMilestone}
            onSubmitProof={handleSubmitProof}
          />
        )}

        {/* 工作量证明提交模态框 */}
        <SubmitProofModal
          isOpen={isProofModalOpen}
          onClose={() => {
            setIsProofModalOpen(false);
            setSelectedMilestoneIndex(null);
          }}
          taskId={taskId}
          milestoneIndex={selectedMilestoneIndex}
          onSubmitProof={handleSubmitMilestoneProof}
        />

        {/* 操作区：延长截止日期和增加奖励同一行 */}
        {isTaskCreator && (
          <div className="flex flex-wrap gap-4 mt-2">
            <div className="flex-1 min-w-[220px]">
              <ExtendDeadline
                taskId={taskId}
                currentDeadline={BigInt(deadline)}
                taskCreator={creator.address}
                onSuccess={fetchTask}
              />
            </div>
            <div className="flex-1 min-w-[220px]">
              <IncreaseReward taskId={taskId} taskCreator={creator.address} onSuccess={fetchTask} />
            </div>
          </div>
        )}

        {/* 添加工作者模态框 */}
        <AddWorkerModal
          isOpen={isAddWorkerModalOpen}
          onClose={() => setIsAddWorkerModalOpen(false)}
          taskId={taskId}
          onAddWorker={handleAddWorker}
        />

        {/* 添加里程碑模态框 */}
        <AddMilestoneModal
          isOpen={isAddMilestoneModalOpen}
          onClose={() => setIsAddMilestoneModalOpen(false)}
          taskId={taskId}
          onAddMilestone={handleAddMilestone}
        />
      </div>
    </div>
  );
};

export default MilestoneTaskDetailPage;
