import { PR } from '@octoreport/core';
import Table from 'cli-table3';
import type { Table as TableType } from 'cli-table3';

export interface TableConfig {
  width: number;
  title: string;
  key: keyof PR;
}

export type TablePRData = Omit<PR, 'labels' | 'reviewers' | 'comments'>;

export interface TableData {
  data: PR[];
  additionalColumns: (pr: PR) => PR[keyof PR][];
  count: number;
}

export function createTable(columnList: string[], columnWidthList: number[]) {
  return new Table({
    head: columnList,
    wordWrap: true,
    colWidths: columnWidthList,
  });
}

export function addTotalRow(table: TableType, count: number, totalColSpan: number) {
  table.push([
    { content: 'Total', hAlign: 'left', colSpan: 1 },
    { content: count, hAlign: 'left', colSpan: totalColSpan - 1 },
  ]);
}

export function renderTable(tableConfig: TableConfig[], prList: PR[], isAddTotalRow = true) {
  const table = createTable(
    tableConfig.map((column) => column.title),
    tableConfig.map((column) => column.width),
  );
  const rowList = prList.map((pr) => [
    ...tableConfig.map((column) => {
      const value = pr[column.key];
      if (Array.isArray(value)) {
        return value.map((item) => item).join(', ');
      } else {
        return value;
      }
    }),
  ]);
  table.push(...rowList);

  if (isAddTotalRow) {
    addTotalRow(table, prList.length, tableConfig.length);
  }

  console.log(table.toString());
}
