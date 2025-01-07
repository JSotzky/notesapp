import React, { useState, useEffect } from "react";
import {
  Authenticator,
  Button,
  TextField,
  Heading,
  Flex,
  Divider,
  View,
} from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import "@aws-amplify/ui-react/styles.css";
import { generateClient } from "aws-amplify/data";
import outputs from "../amplify_outputs.json";

// -------- TanStack Table imports ----------
import {
  useReactTable,
  createColumnHelper,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

Amplify.configure(outputs);
const client = generateClient({
  authMode: "userPool",
});

export default function App() {
  const [transactions, setTransactions] = useState([]);

  // Fetch the data on mount
  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    try {
      const { data: txList } = await client.models.Transaction.list();
      setTransactions(txList);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  }

  // Create a new transaction from the bottom row
  async function createTransaction(event) {
    event.preventDefault();
    const form = new FormData(event.target);

    // Adjust these to match your schema's field names
    const transactionData = {
      date: form.get("date"),
      payee: form.get("payee"),
      category: form.get("category"),
      memo: form.get("memo"),
      inflow: parseFloat(form.get("inflow") || 0),
      outflow: parseFloat(form.get("outflow") || 0),
    };

    try {
      const { data: newTx } = await client.models.Transaction.create(
        transactionData
      );
      console.log("Created transaction:", newTx);
      fetchTransactions();
      // Reset the bottom-row inputs
      event.target.reset();
    } catch (error) {
      console.error("Error creating transaction:", error);
    }
  }

  // Delete a transaction
  async function deleteTransaction(tx) {
    try {
      const { data: deleted } = await client.models.Transaction.delete({
        id: tx.id,
      });
      console.log("Deleted transaction:", deleted);
      fetchTransactions();
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  }

  // ------------------ TANSTACK TABLE SETUP ------------------
  const columnHelper = createColumnHelper();

  const columns = [
    columnHelper.accessor("date", {
      header: "Date",
      cell: (info) => info.getValue() || "—",
    }),
    columnHelper.accessor("payee", {
      header: "Payee",
      cell: (info) => info.getValue() || "—",
    }),
    columnHelper.accessor("category", {
      header: "Category",
      cell: (info) => info.getValue() || "—",
    }),
    columnHelper.accessor("memo", {
      header: "Memo",
      cell: (info) => info.getValue() || "",
    }),
    columnHelper.accessor("outflow", {
      header: "Outflow",
      cell: (info) => info.getValue() ?? 0,
    }),
    columnHelper.accessor("inflow", {
      header: "Inflow",
      cell: (info) => info.getValue() ?? 0,
    }),

    // "Actions" column for delete, etc.
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => {
        const rowItem = info.row.original;
        return (
          <Button
            variation="destructive"
            onClick={() => deleteTransaction(rowItem)}
          >
            Delete
          </Button>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Authenticator>
      {({ signOut }) => (
        <Flex
          direction="column"
          width="80%"
          margin="0 auto"
          padding="2rem"
          gap="2rem"
        >
          <Heading level={1}>My Budget App</Heading>

          <Heading level={2}>Transactions</Heading>

          {/* 
            Wrap the entire table (existing rows + bottom row form) 
            in a single form. 
          */}
          <View as="form" onSubmit={createTransaction}>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  backgroundColor: "grey",
                }}
              >
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          style={{
                            borderBottom: "2px solid #ccc",
                            padding: "0.5rem",
                          }}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} style={{ borderBottom: "1px solid #eee" }}>
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} style={{ padding: "0.5rem" }}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}

                  {/* Bottom row for adding a transaction */}
                  <tr>
                    <td style={{ padding: "0.5rem" }}>
                      <TextField
                        type="date"
                        name="date"
                        label="Date"
                        labelHidden
                        placeholder="Date"
                        required
                      />
                    </td>
                    <td style={{ padding: "0.5rem" }}>
                      <TextField
                        name="payee"
                        label="Payee"
                        labelHidden
                        placeholder="Payee"
                      />
                    </td>
                    <td style={{ padding: "0.5rem" }}>
                      <TextField
                        name="category"
                        label="Category"
                        labelHidden
                        placeholder="Category"
                      />
                    </td>
                    <td style={{ padding: "0.5rem" }}>
                      <TextField
                        name="memo"
                        label="Memo"
                        labelHidden
                        placeholder="Memo"
                      />
                    </td>
                    <td style={{ padding: "0.5rem" }}>
                      <TextField
                        name="outflow"
                        label="Outflow"
                        labelHidden
                        placeholder="Outflow"
                      />
                    </td>
                    <td style={{ padding: "0.5rem" }}>
                      <TextField
                        name="inflow"
                        label="Inflow"
                        labelHidden
                        placeholder="Inflow"
                      />
                    </td>

                    {/* Submit button cell */}
                    <td style={{ padding: "0.5rem", textAlign: "center" }}>
                      <Button type="submit" variation="primary">
                        Add
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </View>

          <Divider />

          <Button onClick={signOut}>Sign Out</Button>
        </Flex>
      )}
    </Authenticator>
  );
}
