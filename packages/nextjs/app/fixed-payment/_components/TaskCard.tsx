import Link from "next/link";
import { Address } from "~~/components/scaffold-eth";

interface TaskCardProps {
  task: any; // GraphQL获取的任务数据
}

export const TaskCard = ({ task }: TaskCardProps) => {
  const formatDeadline = (deadline: string) => {
    const date = new Date(Number(deadline) * 1000);
    return date.toLocaleString();
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "Open":
        return "Open";
      case "InProgress":
        return "InProgress";
      case "Completed":
        return "Completed";
      case "Paid":
        return "Paid";
      case "Cancelled":
        return "Cancelled";
      default:
        return "Unknown";
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

  // 截取描述的前100个字符作为简短描述
  const shortDescription =
    task.description.length > 100 ? task.description.substring(0, 100) + "..." : task.description;

  return (
    <Link
      href={`/fixed-payment/${task.taskId.toString()}`}
      className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow border border-base-300"
    >
      <div className="card-body p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="card-title text-lg">{task.title}</h3>
            <p className="text-xs text-gray-500 mb-2">任务ID: #{task.taskId.toString()}</p>
          </div>
          <span className={`badge ${getStatusColor(task.status)} badge-sm`}>{getStatusText(task.status)}</span>
        </div>

        <p className="text-sm mb-2">{shortDescription}</p>

        <div className="text-xs text-gray-500 flex justify-between">
          <span>截止时间:</span>
          <span>{formatDeadline(task.deadline)}</span>
        </div>

        <div className="mt-2 text-xs">
          <span className="text-gray-500">创建者: </span>
          <Address address={task.creator?.address || task.creator} format="short" disableAddressLink />
        </div>

        <div className="mt-2 text-xs">
          <span className="text-gray-500">工作者: </span>
          {task.worker ? (
            <Address address={task.worker?.address || task.worker} format="short" disableAddressLink />
          ) : (
            <span>暂无</span>
          )}
        </div>
      </div>
    </Link>
  );
};
