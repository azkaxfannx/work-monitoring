"use client";

import { useState, useEffect, useCallback } from "react";
import { useSocket } from "@/components/providers/SocketProvider";
import type { Division, RowWithCells } from "@/types";

export function useDivisions() {
  const { socket } = useSocket();
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all divisions
  const fetchDivisions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/divisions");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setDivisions(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchDivisions();
  }, [fetchDivisions]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const onDivisionCreated = (division: Division) => {
      setDivisions((prev) => {
        if (prev.some((d) => d.id === division.id)) return prev;
        return [...prev, division];
      });
    };

    const onDivisionUpdated = (division: Division) => {
      setDivisions((prev) =>
        prev.map((d) => (d.id === division.id ? division : d)),
      );
    };

    const onDivisionDeleted = ({ id }: { id: string }) => {
      setDivisions((prev) => prev.filter((d) => d.id !== id));
    };

    const onRowCreated = ({
      divisionId,
      row,
    }: {
      divisionId: string;
      row: RowWithCells;
    }) => {
      setDivisions((prev) =>
        prev.map((d) => {
          if (d.id !== divisionId) return d;
          if (d.rows.some((r) => r.id === row.id)) return d;
          return { ...d, rows: [...d.rows, row] };
        }),
      );
    };

    const onRowUpdated = ({
      divisionId,
      row,
    }: {
      divisionId: string;
      row: RowWithCells;
    }) => {
      setDivisions((prev) =>
        prev.map((d) => {
          if (d.id !== divisionId) return d;
          return {
            ...d,
            rows: d.rows.map((r) => (r.id === row.id ? row : r)),
          };
        }),
      );
    };

    const onRowDeleted = ({
      divisionId,
      rowId,
    }: {
      divisionId: string;
      rowId: string;
    }) => {
      setDivisions((prev) =>
        prev.map((d) => {
          if (d.id !== divisionId) return d;
          return { ...d, rows: d.rows.filter((r) => r.id !== rowId) };
        }),
      );
    };

    socket.on("division:created", onDivisionCreated);
    socket.on("division:updated", onDivisionUpdated);
    socket.on("division:deleted", onDivisionDeleted);
    socket.on("row:created", onRowCreated);
    socket.on("row:updated", onRowUpdated);
    socket.on("row:deleted", onRowDeleted);

    return () => {
      socket.off("division:created", onDivisionCreated);
      socket.off("division:updated", onDivisionUpdated);
      socket.off("division:deleted", onDivisionDeleted);
      socket.off("row:created", onRowCreated);
      socket.off("row:updated", onRowUpdated);
      socket.off("row:deleted", onRowDeleted);
    };
  }, [socket]);

  // Mutations
  const addRow = useCallback(async (divisionId: string) => {
    const res = await fetch(`/api/divisions/${divisionId}/rows`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to add row");
  }, []);

  const updateCell = useCallback(
    async (
      divisionId: string,
      rowId: string,
      columnId: string,
      value: string,
    ) => {
      const res = await fetch(`/api/divisions/${divisionId}/rows`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rowId,
          cells: [{ columnId, value }],
        }),
      });
      if (!res.ok) throw new Error("Failed to update cell");
    },
    [],
  );

  const deleteRow = useCallback(async (divisionId: string, rowId: string) => {
    const res = await fetch(`/api/divisions/${divisionId}/rows`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rowId }),
    });
    if (!res.ok) throw new Error("Failed to delete row");
  }, []);

  return {
    divisions,
    loading,
    error,
    refetch: fetchDivisions,
    addRow,
    updateCell,
    deleteRow,
  };
}
