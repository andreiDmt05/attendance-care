import { User } from "@/types";
import { formatDate } from "@/lib/utils";
import Modal from "@/components/Modal";
import Badge from "@/components/Badge";

interface EmployeeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: User | null;
}

export default function EmployeeDetailsModal({
  isOpen,
  onClose,
  employee,
}: EmployeeDetailsModalProps) {
  if (!employee) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Employee Details">
      <div className="flex flex-col gap-3 text-sm">
        <div>
          <p className="text-slate-500">Name</p>
          <p className="font-medium text-slate-900">{employee.name}</p>
        </div>
        <div>
          <p className="text-slate-500">Email</p>
          <p className="font-medium text-slate-900">{employee.email}</p>
        </div>
        <div>
          <p className="text-slate-500">Role</p>
          <p className="font-medium text-slate-900">{employee.role}</p>
        </div>
        <div>
          <p className="text-slate-500">Status</p>
          <Badge color={employee.isActive ? "green" : "red"}>
            {employee.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
        <div>
          <p className="text-slate-500">Created</p>
          <p className="font-medium text-slate-900">{formatDate(employee.createdAt)}</p>
        </div>
      </div>
    </Modal>
  );
}
