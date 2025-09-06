"use client";

import { useState } from "react";
import { useDeployedContractInfo, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export const DisputeButton = ({
  taskId,
  taskData,
  taskProof,
  disputeProcessingRewardBps,
  onSuccess,
}: {
  taskId: string;
  taskData: any;
  taskProof: any;
  disputeProcessingRewardBps: bigint | undefined;
  onSuccess?: () => void;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { writeContractAsync: approveToken } = useScaffoldWriteContract({ contractName: "TaskToken" });
  const { writeContractAsync: fileDisputeByWorker } = useScaffoldWriteContract({ contractName: "FixedPaymentTask" });
  const { data: fixedPaymentTaskContract } = useDeployedContractInfo({ contractName: "FixedPaymentTask" });

  const handleFileDispute = async () => {
    try {
      setIsLoading(true);

      // 计算需要批准的金额
      if (taskData) {
        const rewardAmount = taskData[1]; // totalreward
        const processingRewardBps = disputeProcessingRewardBps || BigInt(50); // 默认0.5%
        const processingReward = (rewardAmount * processingRewardBps) / BigInt(10000);

        // 批准代币
        await approveToken({
          functionName: "approve",
          args: [fixedPaymentTaskContract?.address || "", processingReward],
        });
      }

      await fileDisputeByWorker({
        functionName: "fileDisputeByWorker",
        args: [BigInt(taskId)],
      });
      setIsModalOpen(false);
      onSuccess?.();
    } catch (e) {
      console.error("Error filing dispute:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // 只有当用户是工作者且工作量证明已提交但未批准时才显示按钮
  if (!taskProof || !taskProof[0] || taskProof[1]) {
    return null;
  }

  return (
    <>
      <button className="btn btn-error" onClick={() => setIsModalOpen(true)}>
        提出纠纷
      </button>

      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">确认提交纠纷</h3>
            <p className="py-4">确定要提交纠纷吗？这将冻结任务资金直到纠纷解决。</p>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setIsModalOpen(false)} disabled={isLoading}>
                返回
              </button>
              <button className="btn btn-error" onClick={handleFileDispute} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    提交中...
                  </>
                ) : (
                  "确认提交"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
