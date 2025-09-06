"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AdminVoting } from "./_components/AdminVoting";
import { useDisputeData } from "./_components/DisputeDataProvider";
import { DisputeInfo } from "./_components/DisputeInfo";
import { DistributionProposal } from "./_components/DistributionProposal";
import { useAccount } from "wagmi";
import { useDeployedContractInfo, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

// 固定的纠纷处理奖励比例 (以基点表示，100基点=1%)
const DISPUTE_PROCESSING_REWARD_BPS = 50n; // 0.5%
const DENOMINATOR_FEE = 10000n;

export default function DisputeDetailPage() {
  const { disputeId } = useParams<{ disputeId: string }>();
  const { address: connectedAddress } = useAccount();

  const [voteAmount, setVoteAmount] = useState("");

  const [isVoting, setIsVoting] = useState(false);
  const [isProcessingVotes, setIsProcessingVotes] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isDistributing, setIsDistributing] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const { writeContractAsync: voteOnDispute } = useScaffoldWriteContract({ contractName: "DisputeResolver" });
  const { writeContractAsync: processVotes } = useScaffoldWriteContract({ contractName: "DisputeResolver" });
  const { writeContractAsync: approveProposal } = useScaffoldWriteContract({ contractName: "DisputeResolver" });
  const { writeContractAsync: distributeFunds } = useScaffoldWriteContract({ contractName: "DisputeResolver" });
  const { writeContractAsync: rejectProposal } = useScaffoldWriteContract({ contractName: "DisputeResolver" });
  const { writeContractAsync: approveToken } = useScaffoldWriteContract({ contractName: "TaskToken" });

  // 获取DisputeResolver合约信息
  const { data: disputeResolver } = useDeployedContractInfo({ contractName: "DisputeResolver" });

  // 使用专门的数据获取hook
  const { disputeData, disputeLoading, distributionProposal, hasVoted, isAdmin, refreshDisputeData } = useDisputeData({
    disputeId,
    connectedAddress,
  });

  const isWorker =
    disputeData &&
    disputeData.worker &&
    connectedAddress &&
    disputeData.worker.address?.toLowerCase() === connectedAddress?.toLowerCase();
  const isTaskCreator =
    disputeData &&
    disputeData.taskCreator &&
    connectedAddress &&
    disputeData.taskCreator.address?.toLowerCase() === connectedAddress?.toLowerCase();
  const disputeStatus = disputeData ? disputeData.status : "Unknown";

  const canVote = isAdmin && disputeStatus === "Filed";
  const canProcess =
    isAdmin && disputeStatus === "Filed" && disputeData && disputeData.votes && disputeData.votes.length >= 3;
  const canApprove = (isWorker || isTaskCreator) && disputeStatus === "Resolved";
  const canDistribute =
    disputeStatus === "Resolved" &&
    distributionProposal &&
    distributionProposal[1] && // workerApproved
    distributionProposal[2]; // creatorApproved
  const canReject = (isWorker || isTaskCreator) && disputeStatus === "Resolved";

  const getStatusText = (status: string) => {
    switch (status) {
      case "Filed":
        return "已提交";
      case "Resolved":
        return "已解决";
      case "Distributed":
        return "已分配";
      default:
        return "未知";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Filed":
        return "badge-warning";
      case "Resolved":
        return "badge-info";
      case "Distributed":
        return "badge-success";
      default:
        return "badge-ghost";
    }
  };

  const handleVote = async () => {
    if (!voteAmount) {
      notification.error("请输入投票金额");
      return;
    }

    if (!disputeData || !disputeData.rewardAmount) {
      notification.error("无法获取奖励金额");
      return;
    }

    const voteAmountWei = BigInt(Math.round(parseFloat(voteAmount) * 1e18));
    if (voteAmountWei > BigInt(disputeData.rewardAmount)) {
      notification.error("投票金额不能超过奖励金额");
      return;
    }

    try {
      setIsVoting(true);
      await voteOnDispute({
        functionName: "voteOnDispute",
        args: [BigInt(disputeId || 0), voteAmountWei],
      });

      notification.success("投票成功！");
      setVoteAmount("");

      // 重新获取纠纷数据
      setTimeout(() => {
        refreshDisputeData();
      }, 1000);
    } catch (error) {
      console.error("Error voting on dispute:", error);
      notification.error("投票失败");
    } finally {
      setIsVoting(false);
    }
  };

  const handleProcessVotes = async () => {
    try {
      setIsProcessingVotes(true);
      await processVotes({
        functionName: "processVotes",
        args: [BigInt(disputeId || 0)],
      });

      notification.success("处理投票成功！");

      // 重新获取纠纷数据
      setTimeout(() => {
        refreshDisputeData();
      }, 1000);
    } catch (error) {
      console.error("Error processing votes:", error);
      notification.error("处理投票失败");
    } finally {
      setIsProcessingVotes(false);
    }
  };

  const handleApprove = async () => {
    try {
      setIsApproving(true);
      await approveProposal({
        functionName: "approveProposal",
        args: [BigInt(disputeId || 0)],
      });

      notification.success("批准提案成功！");

      // 重新获取纠纷数据
      setTimeout(() => {
        refreshDisputeData();
      }, 1000);
    } catch (error) {
      console.error("Error approving proposal:", error);
      notification.error("批准提案失败");
    } finally {
      setIsApproving(false);
    }
  };

  const handleDistribute = async () => {
    try {
      setIsDistributing(true);
      await distributeFunds({
        functionName: "distributeFunds",
        args: [BigInt(disputeId || 0)],
      });

      notification.success("分配资金成功！");

      // 重新获取纠纷数据
      setTimeout(() => {
        refreshDisputeData();
      }, 1000);
    } catch (error) {
      console.error("Error distributing funds:", error);
      notification.error("分配资金失败");
    } finally {
      setIsDistributing(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsRejecting(true);

      // 计算处理费用
      if (disputeData && DISPUTE_PROCESSING_REWARD_BPS) {
        const processingReward = (BigInt(disputeData.rewardAmount) * DISPUTE_PROCESSING_REWARD_BPS) / DENOMINATOR_FEE;

        if (processingReward > 0n) {
          // 先授权合约可以转移处理费用
          await approveToken({
            functionName: "approve",
            args: [disputeResolver?.address, processingReward],
          });
        }
      }

      await rejectProposal({
        functionName: "rejectProposal",
        args: [BigInt(disputeId || 0)],
      });

      notification.success("拒绝提案成功！");

      // 重新获取纠纷数据
      setTimeout(() => {
        refreshDisputeData();
      }, 1000);
    } catch (error) {
      console.error("Error rejecting proposal:", error);
      notification.error("拒绝提案失败");
    } finally {
      setIsRejecting(false);
    }
  };

  if (disputeLoading) {
    return (
      <div className="flex flex-col items-center pt-10 px-4 w-full">
        <div className="w-full max-w-4xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">纠纷详情</h1>
            <Link href="/dispute" className="btn btn-sm btn-outline">
              ← 返回纠纷列表
            </Link>
          </div>
          <div className="bg-base-100 rounded-3xl shadow-md shadow-secondary border border-base-300 p-6">
            <div className="text-center py-8">
              <span className="loading loading-spinner loading-lg"></span>
              <p className="mt-4">正在加载纠纷数据...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!disputeData) {
    return (
      <div className="flex flex-col items-center pt-10 px-4 w-full">
        <div className="w-full max-w-4xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">纠纷详情</h1>
            <Link href="/dispute" className="btn btn-sm btn-outline">
              ← 返回纠纷列表
            </Link>
          </div>
          <div className="bg-base-100 rounded-3xl shadow-md shadow-secondary border border-base-300 p-6">
            <div className="text-center py-8 text-error">
              <p>无法获取纠纷数据</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center pt-10 px-4 w-full">
      <div className="w-full max-w-4xl">
        {/* 合并的DisputeHeader内容 */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">纠纷详情</h1>
          <Link href="/dispute" className="btn btn-sm btn-outline">
            ← 返回纠纷列表
          </Link>
        </div>

        <DisputeInfo
          disputeId={disputeId}
          disputeData={disputeData}
          getStatusText={getStatusText}
          getStatusColor={getStatusColor}
        />

        {/* 管理员投票部分 */}
        <AdminVoting
          disputeData={disputeData}
          canVote={!!canVote}
          canProcess={!!canProcess}
          hasVoted={hasVoted}
          isVoting={isVoting}
          isProcessingVotes={isProcessingVotes}
          voteAmount={voteAmount}
          setVoteAmount={setVoteAmount}
          handleVote={handleVote}
          handleProcessVotes={handleProcessVotes}
        />

        {/* 分配方案部分 */}
        {disputeStatus === "Resolved" && (
          <DistributionProposal
            disputeData={disputeData}
            distributionProposal={distributionProposal}
            canApprove={!!canApprove}
            canDistribute={!!canDistribute}
            canReject={!!canReject}
            isApproving={isApproving}
            isDistributing={isDistributing}
            isRejecting={isRejecting}
            isWorker={!!isWorker}
            handleApprove={handleApprove}
            handleDistribute={handleDistribute}
            handleReject={handleReject}
          />
        )}
      </div>
    </div>
  );
}
