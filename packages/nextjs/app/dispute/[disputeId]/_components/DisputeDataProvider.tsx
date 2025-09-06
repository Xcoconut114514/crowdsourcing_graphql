"use client";

import { useEffect, useState } from "react";
import { getBuiltGraphSDK } from "~~/.graphclient";

interface DisputeData {
  id: string;
  disputeId: string;
  taskId: string;
  taskContract: string;
  worker: {
    id: string;
    address: string;
  };
  taskCreator: {
    id: string;
    address: string;
  };
  rewardAmount: string;
  workerShare: string;
  status: string;
  proofOfWork: string;
  workerApproved: boolean;
  creatorApproved: boolean;
  votes: any[];
  createdAt: string;
  resolvedAt: string;
  distributedAt: string;
}

interface UseDisputeDataProps {
  disputeId: string;
  connectedAddress: string | undefined;
}

export const useDisputeData = ({ disputeId, connectedAddress }: UseDisputeDataProps) => {
  const [disputeData, setDisputeData] = useState<DisputeData | null>(null);
  const [disputeLoading, setDisputeLoading] = useState(true);
  const [distributionProposal, setDistributionProposal] = useState<any>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchDisputeData = async () => {
      if (!disputeId) return;

      // 获取 GraphQL SDK
      const sdk = getBuiltGraphSDK();

      try {
        setDisputeLoading(true);

        // 获取纠纷详情
        const disputeResult = await sdk.GetDispute({
          id: disputeId,
        });

        if (disputeResult?.dispute) {
          setDisputeData(disputeResult.dispute as DisputeData);

          // 设置分配方案数据
          if (disputeResult.dispute.workerShare) {
            setDistributionProposal([
              disputeResult.dispute.workerShare,
              disputeResult.dispute.workerApproved,
              disputeResult.dispute.creatorApproved,
            ]);
          }

          // 检查当前用户是否已投票
          if (connectedAddress && disputeResult.dispute.votes) {
            const userVote = disputeResult.dispute.votes.find(
              (vote: any) => vote.admin.address.toLowerCase() === connectedAddress.toLowerCase(),
            );
            setHasVoted(!!userVote);
          }

          // 检查当前用户是否为管理员
          if (connectedAddress) {
            // 从子图获取管理员信息
            sdk
              .GetAdmin({ id: connectedAddress.toLowerCase() })
              .then(adminResult => {
                if (adminResult?.admin) {
                  setIsAdmin(adminResult.admin.isActive);
                }
              })
              .catch(err => {
                console.error("Error fetching admin data:", err);
              });
          }
        }
      } catch (err) {
        console.error("Error fetching dispute data:", err);
      } finally {
        setDisputeLoading(false);
      }
    };

    fetchDisputeData();
  }, [disputeId, connectedAddress]);

  const refreshDisputeData = async () => {
    // 获取 GraphQL SDK
    const sdk = getBuiltGraphSDK();

    try {
      const disputeResult = await sdk.GetDispute({
        id: disputeId,
      });

      if (disputeResult?.dispute) {
        setDisputeData(disputeResult.dispute as DisputeData);

        // 更新分配方案数据
        if (disputeResult.dispute.workerShare) {
          setDistributionProposal([
            disputeResult.dispute.workerShare,
            disputeResult.dispute.workerApproved,
            disputeResult.dispute.creatorApproved,
          ]);
        }

        // 检查当前用户是否已投票
        if (connectedAddress && disputeResult.dispute.votes) {
          const userVote = disputeResult.dispute.votes.find(
            (vote: any) => vote.admin.address.toLowerCase() === connectedAddress.toLowerCase(),
          );
          setHasVoted(!!userVote);
        }
      }
    } catch (err) {
      console.error("Error refreshing dispute data:", err);
    }
  };

  return {
    disputeData,
    disputeLoading,
    distributionProposal,
    hasVoted,
    isAdmin,
    refreshDisputeData,
  };
};
