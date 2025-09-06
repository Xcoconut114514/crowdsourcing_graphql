import { useState } from "react";
import { AddressInput } from "~~/components/scaffold-eth";

interface AddWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  onAddWorker: (workerAddress: string, reward: string) => void;
}

export const AddWorkerModal = ({ isOpen, onClose, onAddWorker }: AddWorkerModalProps) => {
  const [workerAddress, setWorkerAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!workerAddress) {
      alert("请填写工作者地址");
      return;
    }

    try {
      setIsSubmitting(true);
      // 传递空字符串作为报酬参数，因为添加工作者时不再需要输入报酬
      onAddWorker(workerAddress, "");

      // 重置表单
      setWorkerAddress("");
    } catch (e) {
      console.error("Error adding worker:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">分配工作者</h3>

        <form onSubmit={handleSubmit}>
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text font-bold">工作者地址</span>
            </label>
            <AddressInput
              value={workerAddress}
              onChange={value => setWorkerAddress(value)}
              placeholder="输入工作者地址"
            />
          </div>

          <div className="modal-action">
            <button type="button" className="btn" onClick={onClose} disabled={isSubmitting}>
              取消
            </button>
            <button
              type="submit"
              className={`btn btn-primary ${isSubmitting ? "loading" : ""}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "分配中..." : "确认分配"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
