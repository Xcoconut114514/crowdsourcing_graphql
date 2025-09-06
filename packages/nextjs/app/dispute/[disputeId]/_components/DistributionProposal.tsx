"use client";

interface DistributionProposalProps {
  disputeData: any;
  distributionProposal: any;
  canApprove: boolean;
  canDistribute: boolean;
  canReject: boolean;
  isApproving: boolean;
  isDistributing: boolean;
  isRejecting: boolean;
  isWorker: boolean;
  handleApprove: () => void;
  handleDistribute: () => void;
  handleReject: () => void;
}

export const DistributionProposal = ({
  disputeData,
  canApprove,
  canDistribute,
  canReject,
  isApproving,
  isDistributing,
  isRejecting,
  isWorker,
  handleApprove,
  handleDistribute,
  handleReject,
}: DistributionProposalProps) => {
  const disputeStatus = disputeData ? disputeData.status : "Unknown";

  return (
    <div className="bg-base-100 rounded-3xl shadow-md shadow-secondary border border-base-300 p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4">分配方案</h2>

      {disputeStatus === "Resolved" && disputeData.workerShare && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-base-200 p-4 rounded-xl">
              <p className="text-sm text-gray-500">工作者份额</p>
              <p className="font-bold">
                {disputeData.workerShare ? (Number(disputeData.workerShare) / 1e18).toFixed(2) : "0.00"} TST
              </p>
            </div>
            <div className="bg-base-200 p-4 rounded-xl">
              <p className="text-sm text-gray-500">创建者份额</p>
              <p className="font-bold">
                {disputeData.rewardAmount && disputeData.workerShare
                  ? (Number(disputeData.rewardAmount - disputeData.workerShare) / 1e18).toFixed(2)
                  : "0.00"}{" "}
                TST
              </p>
            </div>
            <div className="bg-base-200 p-4 rounded-xl">
              <p className="text-sm text-gray-500">工作者批准</p>
              <p className={disputeData.workerApproved ? "text-green-500 font-bold" : "text-red-500 font-bold"}>
                {disputeData.workerApproved ? "已批准" : "未批准"}
              </p>
            </div>
            <div className="bg-base-200 p-4 rounded-xl">
              <p className="text-sm text-gray-500">创建者批准</p>
              <p className={disputeData.creatorApproved ? "text-green-500 font-bold" : "text-red-500 font-bold"}>
                {disputeData.creatorApproved ? "已批准" : "未批准"}
              </p>
            </div>
          </div>

          {canApprove && (
            <div className="mb-4">
              <button
                className={`btn ${isWorker ? "btn-primary" : "btn-secondary"} w-full ${isApproving ? "loading" : ""}`}
                onClick={handleApprove}
                disabled={isApproving}
              >
                {isWorker ? "工作者批准" : "创建者批准"}
              </button>
            </div>
          )}

          {canReject && (
            <div className="mb-4">
              <button
                className={`btn btn-error w-full ${isRejecting ? "loading" : ""}`}
                onClick={handleReject}
                disabled={isRejecting}
              >
                拒绝提案
              </button>
            </div>
          )}

          {canDistribute && (
            <div className="mb-4">
              <button
                className={`btn btn-success w-full ${isDistributing ? "loading" : ""}`}
                onClick={handleDistribute}
                disabled={isDistributing}
              >
                分配资金
              </button>
            </div>
          )}
        </>
      )}

      {disputeStatus === "Distributed" && (
        <div className="text-center py-8">
          <div className="text-success text-5xl mb-4">✓</div>
          <h3 className="text-xl font-bold mb-2">资金已分配</h3>
          <p className="text-gray-600">纠纷已解决，资金已成功分配</p>
          {disputeData.distributedAt && (
            <p className="text-sm text-gray-500 mt-2">
              分配时间: {new Date(Number(disputeData.distributedAt) * 1000).toLocaleString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
