import Link from "next/link";
import { Address } from "../scaffold-eth";

interface TaskCardProps {
  task: any; // GraphQL获取的任务数据
  basePath?: string; // 可选的基础路径，默认为 '/fixed-payment'
}

export const TaskCard = ({ task, basePath = "/fixed-payment" }: TaskCardProps) => {
  const formatDeadline = (deadline: string) => {
    const date = new Date(Number(deadline) * 1000);
    return date.toLocaleString();
  };

  const formatReward = (reward: string) => {
    // 检查reward是否有效
    if (!reward) return "0";

    // 将reward从wei转换为ether（除以1e18）
    try {
      const rewardInEther = BigInt(reward) / BigInt(1e18);
      return rewardInEther.toString();
    } catch (e) {
      console.error("Error formatting reward:", e);
      return "0";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "badge-success";
      case "InProgress":
        return "badge-warning";
      case "Completed":
        return "badge-info";
      case "Paid":
        return "badge-primary";
      case "Cancelled":
        return "badge-error";
      default:
        return "badge-ghost";
    }
  };

  // 检查必要字段
  if (!task) {
    return <div className="card bg-base-100 shadow-lg border border-base-300">无效任务数据</div>;
  }

  // 截取描述的前100个字符作为简短描述
  const shortDescription =
    task.description && task.description.length > 100
      ? task.description.substring(0, 100) + "..."
      : task.description || "";

  return (
    <Link
      href={`${basePath}/${task.taskId ? task.taskId.toString() : ""}`}
      className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow border border-base-300"
    >
      <div className="card-body p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="card-title text-lg">{task.title || "未命名任务"}</h3>
            <p className="text-xs text-gray-500 mb-2">任务ID: #{task.taskId ? task.taskId.toString() : "未知"}</p>
          </div>
          <span className={`badge ${getStatusColor(task.status)} badge-sm`}>{task.status || "未知状态"}</span>
        </div>

        <p className="text-sm mb-2">{shortDescription}</p>

        <div className="flex justify-between text-xs text-gray-500">
          <span>截止时间:</span>
          <span>{task.deadline ? formatDeadline(task.deadline) : "未设置"}</span>
        </div>

        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>报酬:</span>
          <span>{task.reward ? formatReward(task.reward.toString()) : "0"} Tokens</span>
        </div>

        <div className="mt-2 text-xs">
          <span className="text-gray-500">创建者: </span>
          {task.creator ? (
            <Address address={task.creator.address || task.creator} format="short" disableAddressLink />
          ) : (
            <span>未知</span>
          )}
        </div>

        <div className="mt-2 text-xs">
          <span className="text-gray-500">工作者: </span>
          {task.worker ? (
            <Address address={task.worker.address || task.worker} format="short" disableAddressLink />
          ) : (
            <span>暂无</span>
          )}
        </div>
      </div>
    </Link>
  );
};
