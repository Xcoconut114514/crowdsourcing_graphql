import { useState } from "react";
import { useDeployedContractInfo, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface CancelTaskProps {
  taskId: string;
  taskStatus: number;
  taskData: any;
  taskProof: any;
  disputeProcessingRewardBps: bigint | undefined;
  onSuccess?: () => void;
}

export const CancelTask = ({
  taskId,
  taskStatus,
  taskData,
  taskProof,
  disputeProcessingRewardBps,
  onSuccess,
}: CancelTaskProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { writeContractAsync: cancelTask } = useScaffoldWriteContract({ contractName: "BiddingTask" });
  const { writeContractAsync: approveToken } = useScaffoldWriteContract({ contractName: "TaskToken" });
  const { data: biddingTaskContract } = useDeployedContractInfo({ contractName: "BiddingTask" });

  const handleCancelTask = async () => {
    try {
      // 根据合约逻辑，terminateTask可能需要提交纠纷，需要批准处理奖励
      // 检查是否满足提交纠纷的条件：
      // 1. 有工作者 (worker exists and not zero address)
      // 2. 已提交工作量证明 (proof submitted)
      // 3. 工作量证明尚未批准 (proof not approved)

      // taskData是一个对象，不是数组
      const hasWorker = taskData?.worker && taskData?.worker !== "0x0000000000000000000000000000000000000000";
      const hasProof = taskProof && taskProof[0];
      const isNotApproved = taskProof && !taskProof[1];

      if (hasWorker && hasProof && isNotApproved) {
        // 需要提交纠纷，计算并批准处理奖励
        const rewardAmount = taskData?.reward ? BigInt(taskData.reward) : BigInt(0);
        const processingRewardBps = disputeProcessingRewardBps || BigInt(50); // 默认0.5%
        const processingReward = (rewardAmount * processingRewardBps) / BigInt(10000);

        await approveToken({
          functionName: "approve",
          args: [biddingTaskContract?.address || "", processingReward],
        });
      }

      await cancelTask({
        functionName: "terminateTask",
        args: [BigInt(taskId)],
      });
      setIsModalOpen(false);
      onSuccess?.();
    } catch (e) {
      console.error("Error cancelling task:", e);
    }
  };

  // 只有任务状态为Open (0) 或 InProgress (1) 时才显示取消按钮
  if (taskStatus !== 0 && taskStatus !== 1) {
    return null;
  }

  return (
    <>
      <button className="btn btn-error btn-sm" onClick={() => setIsModalOpen(true)}>
        取消任务
      </button>

      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">确认取消任务</h3>
            <p className="py-4">确定要取消这个任务吗？</p>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>
                返回
              </button>
              <button className="btn btn-error" onClick={handleCancelTask}>
                确认取消
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
