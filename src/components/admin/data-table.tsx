import type { ReactNode } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export interface DataTableColumn<T> {
  key: string
  header: ReactNode
  cell: (row: T) => ReactNode
}

export function DataTable<T>({ rows, columns }: { rows: T[]; columns: Array<DataTableColumn<T>> }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>{columns.map((column) => <TableHead key={column.key}>{column.header}</TableHead>)}</TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((column) => <TableCell key={column.key}>{column.cell(row)}</TableCell>)}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
