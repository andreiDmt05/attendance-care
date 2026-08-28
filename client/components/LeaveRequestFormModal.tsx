"use client";

import { FormEvent, useState } from "react";
import { api, ApiError } from "@/lib/api";
import Modal from "@/components/Modal";
import Input from "@/components/Input";
import Button from "@/components/Button";
import ErrorMessage from "@/components/ErrorMessage";

interface LeaveRequestFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function LeaveRequestFormModal({
  isOpen,
  onClose,
  onSaved,
}: LeaveRequestFormModalProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetAndClose = () => {
    setStartDate("");
    setEndDate("");
    setReason("");
    setError("");
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await api.post("/leaves", { startDate, endDate, reason });
      onSaved();
      resetAndClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to submit leave request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose} title="Request Leave">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <ErrorMessage message={error} />}

        <Input
          id="leave-start"
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />

        <Input
          id="leave-end"
          label="End Date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
        />

        <Input
          id="leave-reason"
          label="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Briefly describe the reason for leave"
          required
        />

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={resetAndClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Submit Request
          </Button>
        </div>
      </form>
    </Modal>
  );
}
