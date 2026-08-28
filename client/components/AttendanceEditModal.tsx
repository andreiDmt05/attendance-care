"use client";

import { FormEvent, useState } from "react";
import { AttendanceRecord } from "@/types";
import { api, ApiError } from "@/lib/api";
import Modal from "@/components/Modal";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Button from "@/components/Button";
import ErrorMessage from "@/components/ErrorMessage";

interface AttendanceEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  record: AttendanceRecord | null;
}

const STATUS_OPTIONS = [
  { label: "Present", value: "PRESENT" },
  { label: "Absent", value: "ABSENT" },
  { label: "Incomplete", value: "INCOMPLETE" },
];

const toDatetimeLocal = (value: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};

export default function AttendanceEditModal({
  isOpen,
  onClose,
  onSaved,
  record,
}: AttendanceEditModalProps) {
  const [clockIn, setClockIn] = useState(toDatetimeLocal(record?.clockIn || null));
  const [clockOut, setClockOut] = useState(toDatetimeLocal(record?.clockOut || null));
  const [status, setStatus] = useState(record?.status || "INCOMPLETE");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!record) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await api.patch(`/attendance/${record._id}`, {
        clockIn: clockIn ? new Date(clockIn).toISOString() : undefined,
        clockOut: clockOut ? new Date(clockOut).toISOString() : undefined,
        status,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update attendance");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Attendance">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <ErrorMessage message={error} />}

        <Input
          id="clock-in"
          label="Clock In"
          type="datetime-local"
          value={clockIn}
          onChange={(e) => setClockIn(e.target.value)}
        />

        <Input
          id="clock-out"
          label="Clock Out"
          type="datetime-local"
          value={clockOut}
          onChange={(e) => setClockOut(e.target.value)}
        />

        <Select
          id="status"
          label="Status"
          options={STATUS_OPTIONS}
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
        />

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
