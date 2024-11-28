import React from "react";

type TableColumn<T> = {
    header: string;
    accessor: (row: T) => React.ReactNode;
    className?: string; // Optional custom class for the column
};

type TableProps<T> = {
    data: T[];
    columns: TableColumn<T>[];
    onRowClick?: (row: T) => void;
    containerClassName?: string;
    tableClassName?: string;
    rowClassName?: string;
    hoverClassName?: string;
};

function Table<T>({
                      data,
                      columns,
                      onRowClick,
                      containerClassName = "flex-grow min-h-[400px] mt-4",
                      tableClassName = "min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden table-fixed",
                      rowClassName = "divide-y divide-gray-200 dark:divide-gray-700",
                      hoverClassName = "hover:bg-gray-100 dark:hover:bg-gray-900",
                  }: TableProps<T>) {
    return (
        <div className={containerClassName}>
            <table className={tableClassName}>
                <thead className="bg-gray-200 dark:bg-gray-700">
                <tr>
                    {columns.map((column, idx) => (
                        <th
                            key={idx}
                            className={`px-4 py-2 text-left text-gray-700 dark:text-gray-300 font-medium ${
                                column.className || ""
                            }`}
                        >
                            {column.header}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody className={rowClassName}>
                {data.map((row, rowIndex) => (
                    <tr
                        key={rowIndex}
                        onClick={() => onRowClick && onRowClick(row)}
                        className={hoverClassName}
                    >
                        {columns.map((column, colIndex) => (
                            <td
                                key={colIndex}
                                className={`px-4 py-2 text-gray-800 dark:text-gray-200 ${
                                    column.className || ""
                                }`}
                            >
                                {column.accessor(row)}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default Table;