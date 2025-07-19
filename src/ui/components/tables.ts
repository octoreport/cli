import { PR } from '@octoreport/core';
import Table from 'cli-table3';
import type { Table as TableType } from 'cli-table3';

export const COMMON_PR_COLUMNS: { width: number; title: string; key: keyof PR }[] = [
  { width: 10, title: 'Number', key: 'number' },
  { width: 30, title: 'Title', key: 'title' },
  { width: 15, title: 'Author', key: 'author' },
  { width: 10, title: 'Target Branch', key: 'targetBranch' },
  { width: 50, title: 'Url', key: 'url' },
  { width: 10, title: 'State', key: 'state' },
];

export function createPRTable(columns: string[], widths: number[]) {
  return new Table({
    head: [...COMMON_PR_COLUMNS.map((column) => column.title), ...columns],
    wordWrap: true,
    colWidths: [...COMMON_PR_COLUMNS.map((column) => column.width), ...widths],
  });
}

export function addTotalRow(table: TableType, count: number, totalColSpan: number) {
  table.push([
    { content: 'Total', hAlign: 'left', colSpan: 1 },
    { content: count, hAlign: 'left', colSpan: totalColSpan },
  ]);
}
