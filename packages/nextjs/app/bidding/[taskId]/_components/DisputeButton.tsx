"use client";

import { useState } from "react";
import { useDeployedContractInfo, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

export const DisputeButton = ({
  taskId,
  taskProof,
  taskData,
  disputeProcessingRewardBps,
  onSuccess,
}: {
  taskId: string;
  taskProof: any;
  taskData: any;
  disputeProcessingRewardBps: bigint | undefined;
  onSuccess?: () => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const { writeContractAsync } = useScaffoldWriteContract({ contractName: "BiddingTask" });
  const { writeContractAsync: approveToken } = useScaffoldWriteContract({ contractName: "TaskToken" });
  const { data: disputeResolver } = useDeployedContractInfo({ contractName: "DisputeResolver" });

  const handleFileDispute = async () => {
    try {
      setIsLoading(true);

      // 计算需要批准的代币数量
      // 根据BaseTask.submitDispute函数，需要批准 disputeProcessingRewardBps * rewardAmount / 10000
      const rewardAmount = taskData?.[1] || BigInt(0); // taskData[1] 是 totalreward 字段
      const processingRewardBps = disputeProcessingRewardBps || BigInt(50); // 默认0.5%
      const processingReward = (rewardAmount * processingRewardBps) / BigInt(10000);

      // 先批准代币给DisputeResolver合约
      await approveToken({
        functionName: "approve",
        args: [disputeResolver?.address || "", processingReward],
      });

      await writeContractAsync({
        functionName: "fileDisputeByWorker",
        args: [BigInt(taskId)],
      });
      notification.success("纠纷提交成功");
      onSuccess?.();
    } catch (e) {
      console.error("Error filing dispute:", e);
      notification.error("提交纠纷失败");
    } finally {
      setIsLoading(false);
    }
  };

  // 只有当用户是工作者且工作量证明已提交但未批准时才显示按钮
  if (!taskProof || !taskProof[0] || taskProof[1]) {
    return null;
  }

  return (
    <button className="btn btn-error" onClick={handleFileDispute} disabled={isLoading}>
      {isLoading ? (
        <>
          <span className="loading loading-spinner loading-xs"></span>
          提交中...
        </>
      ) : (
        "提出纠纷"
      )}
    </button>
  );
};
