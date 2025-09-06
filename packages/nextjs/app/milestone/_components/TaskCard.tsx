import Link from "next/link";
import { Address } from "~~/components/scaffold-eth";

interface TaskCardProps {
  task: any;
  selectedStatus?: number | null;
}

export const TaskCard = ({ task, selectedStatus }: TaskCardProps) => {
  // 从GraphQL查询结果中解构数据
  const { taskId, title, description, totalReward, deadline, status, creator } = task;

  const formatDeadline = (deadline: bigint) => {
    const date = new Date(Number(deadline) * 1000);
    return date.toLocaleString();
  };

  // 将字符串状态转换为数字进行比较
  const statusMap: Record<string, number> = {
    Open: 0,
    InProgress: 1,
    Paid: 3,
    Cancelled: 4,
  };

  const statusNumber = statusMap[status];

  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return "Open";
      case 1:
        return "InProgress";
      case 3:
        return "Paid";
      case 4:
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: // Open
        return "badge-success";
      case 1: // InProgress
        return "badge-warning";
      case 3: // Paid
        return "badge-primary";
      case 4: // Cancelled
        return "badge-error";
      default:
        return "badge-ghost";
    }
  };

  // 如果有状态筛选且当前任务状态不匹配，则不显示该任务
  // 如果没有指定筛选状态，默认只显示Open状态的任务
  if (selectedStatus !== undefined && selectedStatus !== null) {
    if (selectedStatus !== statusNumber) {
      return null;
    }
  } else {
    // 默认只显示Open状态的任务
    if (statusNumber !== 0) {
      return null;
    }
  }

  // 截取描述的前100个字符作为简短描述
  const shortDescription = description.length > 100 ? description.substring(0, 100) + "..." : description;

  return (
    <Link
      href={`/milestone/${taskId.toString()}`}
      className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow border border-base-300"
    >
      <div className="card-body p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="card-title text-lg">{title}</h3>
            <p className="text-xs text-gray-500 mb-2">任务ID: #{taskId.toString()}</p>
          </div>
          <span className={`badge ${getStatusColor(statusNumber)} badge-sm`}>{getStatusText(statusNumber)}</span>
        </div>

        <p className="text-sm mb-2">{shortDescription}</p>

        <div className="flex justify-between text-sm mb-2">
          <div>
            <p className="text-xs text-gray-500">报酬</p>
            <p>{(Number(totalReward) / 1e18).toFixed(2)} TST</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">截止时间</p>
            <p>{formatDeadline(deadline)}</p>
          </div>
        </div>

        <div className="mt-2 text-xs">
          <span className="text-gray-500">创建者: </span>
          <Address address={creator.address} format="short" disableAddressLink />
        </div>
      </div>
    </Link>
  );
};
