export type ColumnType = "TEXT" | "NUMBER" | "DATE" | "DROPDOWN";

export interface Division {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  columns: Column[];
  rows: RowWithCells[];
}

export interface Column {
  id: string;
  divisionId: string;
  name: string;
  type: ColumnType;
  options: string | null;
  order: number;
  createdAt: string;
}

export interface Row {
  id: string;
  divisionId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CellValue {
  id: string;
  rowId: string;
  columnId: string;
  value: string;
  createdAt: string;
  updatedAt: string;
}

export interface RowWithCells extends Row {
  cells: CellValue[];
}
