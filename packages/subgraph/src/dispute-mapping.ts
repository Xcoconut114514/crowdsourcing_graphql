import { BigInt, Address } from "@graphprotocol/graph-ts";
import {
  DisputeResolver_DisputeFiled as DisputeFiledEvent,
  DisputeResolver_DisputeResolved as DisputeResolvedEvent,
  DisputeResolver_ProposalApprovedByWorker as ProposalApprovedByWorkerEvent,
  DisputeResolver_ProposalApprovedByCreator as ProposalApprovedByCreatorEvent,
  DisputeResolver_FundsDistributed as FundsDistributedEvent,
  DisputeResolver_ProposalRejected as ProposalRejectedEvent,
  DisputeResolver_AdminStaked as AdminStakedEvent,
  DisputeResolver_AdminWithdrawn as AdminWithdrawnEvent,
  DisputeResolver_AdminVoted as AdminVotedEvent,
} from "../generated/DisputeResolver/DisputeResolver";
import { Dispute, Admin, AdminVote, User } from "../generated/schema";

// 获取或创建User实体
function getOrCreateUser(address: Address): User {
  let userId = address.toHexString();
  let user = User.load(userId);
  if (!user) {
    user = new User(userId);
    user.address = address;
    user.save();
  }
  return user as User;
}

// 处理提交纠纷事件
export function handleDisputeFiled(event: DisputeFiledEvent): void {
  let disputeId = event.params.disputeId.toString();
  let entity = new Dispute(disputeId);
  entity.disputeId = event.params.disputeId;
  entity.taskId = event.params.taskId;
  entity.taskContract = event.params.taskContract;

  // 修改：使用User实体ID而不是Address
  let worker = getOrCreateUser(event.params.worker);
  let taskCreator = getOrCreateUser(event.params.taskCreator);
  entity.worker = worker.id;
  entity.taskCreator = taskCreator.id;

  entity.rewardAmount = event.params.rewardAmount;
  entity.workerShare = BigInt.fromI32(0);
  entity.proofOfWork = event.params.proof;
  entity.status = "Filed";
  entity.workerApproved = false;
  entity.creatorApproved = false;
  entity.createdAt = event.block.timestamp;
  // 初始化votes字段为空数组
  entity.votes = [];
  entity.save();
}

// 处理纠纷解决事件
export function handleDisputeResolved(event: DisputeResolvedEvent): void {
  let disputeId = event.params.disputeId.toString();
  let entity = Dispute.load(disputeId);

  if (entity) {
    entity.status = "Resolved";
    entity.resolvedAt = event.block.timestamp;
    entity.workerShare = event.params.workerShare;
    entity.save();
  }
}

// 处理工作者批准提案事件
export function handleProposalApprovedByWorker(
  event: ProposalApprovedByWorkerEvent
): void {
  let disputeId = event.params.disputeId.toString();
  let entity = Dispute.load(disputeId);

  if (entity) {
    entity.workerApproved = true;
    entity.save();
  }
}

// 处理创建者批准提案事件
export function handleProposalApprovedByCreator(
  event: ProposalApprovedByCreatorEvent
): void {
  let disputeId = event.params.disputeId.toString();
  let entity = Dispute.load(disputeId);

  if (entity) {
    entity.creatorApproved = true;
    entity.save();
  }
}

// 处理资金分配事件
export function handleFundsDistributed(event: FundsDistributedEvent): void {
  let disputeId = event.params.disputeId.toString();
  let entity = Dispute.load(disputeId);

  if (entity) {
    entity.status = "Distributed";
    entity.distributedAt = event.block.timestamp;
    entity.save();
  }
}

// 处理提案被拒绝事件
export function handleProposalRejected(event: ProposalRejectedEvent): void {
  let disputeId = event.params.disputeId.toString();
  let entity = Dispute.load(disputeId);

  if (entity) {
    entity.status = "Filed";
    entity.workerApproved = false;
    entity.creatorApproved = false;
    // 清空投票列表，与合约中的 delete dispute.votes 操作保持一致
    entity.votes = [];
    entity.save();
  }
}

// 处理管理员质押事件
export function handleAdminStaked(event: AdminStakedEvent): void {
  let adminId = event.params.admin.toHexString();
  let entity = new Admin(adminId);
  entity.address = event.params.admin;
  entity.stakeAmount = event.params.amount;
  entity.isActive = true;
  entity.createdAt = event.block.timestamp;
  entity.updatedAt = event.block.timestamp;
  entity.save();
}

// 处理管理员提取事件
export function handleAdminWithdrawn(event: AdminWithdrawnEvent): void {
  let adminId = event.params.admin.toHexString();
  let entity = Admin.load(adminId);

  if (entity) {
    // 根据合约逻辑，提取质押金后质押金额应为0
    entity.stakeAmount = BigInt.fromI32(0);
    entity.isActive = false;
    entity.updatedAt = event.block.timestamp;
    entity.save();
  }
}

// 处理管理员投票事件
export function handleAdminVoted(event: AdminVotedEvent): void {
  let voteId =
    event.params.disputeId.toString() + "-" + event.params.admin.toHexString();
  let entity = new AdminVote(voteId);
  entity.dispute = event.params.disputeId.toString();
  entity.admin = event.params.admin.toHexString();
  entity.workerShare = event.params.workerShare;
  entity.createdAt = event.block.timestamp;
  entity.save();

  // 更新对应的纠纷实体，将此投票添加到纠纷的投票列表中
  let dispute = Dispute.load(event.params.disputeId.toString());
  if (dispute) {
    let votes = dispute.votes;
    votes.push(entity.id);
    dispute.votes = votes;
    dispute.save();
  }
}
