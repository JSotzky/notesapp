import { useState, useEffect } from "react";
import {
  Authenticator,
  Button,
  Text,
  TextField,
  Heading,
  Flex,
  View,
  Grid,
  Divider,
} from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import "@aws-amplify/ui-react/styles.css";
import { generateClient } from "aws-amplify/data";
import outputs from "../amplify_outputs.json";

Amplify.configure(outputs);
const client = generateClient({
  authMode: "userPool",
});

export default function App() {
  // Replace notes with transactions
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    // Pull from Transaction model instead of Note
    const { data: transactions } = await client.models.Transaction.list();
    // data holds an array of Transaction objects

    setTransactions(transactions);
  }

  async function createTransaction(event) {
    event.preventDefault();
    const form = new FormData(event.target);

    const transactionData = {
      inflow: form.get("inflow"),
      outflow: form.get("outflow"),
      payee: form.get("payee"),
      category: form.get("category"),
      date: form.get("date"),
      memo: form.get("memo"),
    };

    console.log("Transaction Data:", transactionData);

    try {
      const { data: newTransaction } = await client.models.Transaction.create(
        transactionData
      );
      console.log("Created transaction:", newTransaction);
      fetchTransactions(); // Refresh transactions list
      event.target.reset(); // Clear form
    } catch (error) {
      console.error("Error creating transaction:", error);
    }
  }

  async function deleteTransaction(transaction) {
    // Delete by ID
    const { data: deletedTransaction } = await client.models.Transaction.delete(
      {
        id: transaction.id,
      }
    );
    console.log("Deleted transaction:", deletedTransaction);
    fetchTransactions();
  }

  return (
    <Authenticator>
      {({ signOut }) => (
        <Flex
          className="App"
          justifyContent="center"
          alignItems="center"
          direction="column"
          width="70%"
          margin="0 auto"
        >
          <Heading level={1}>My Budget App</Heading>

          {/* Form to create a transaction */}
          <View as="form" margin="3rem 0" onSubmit={createTransaction}>
            <Flex direction="row" gap="2rem" padding="2rem">
              <TextField
                name="inflow"
                placeholder="Transaction Type income"
                label="Inflow"
                labelHidden
                variation="quiet"
              />
              <TextField
                name="outflow"
                placeholder="Expense"
                label="Outflow"
                labelHidden
                variation="quiet"
              />
              <TextField
                name="payee"
                placeholder="Payee"
                label="Payee"
                labelHidden
                variation="quiet"
                required
              />
              <TextField
                name="category"
                placeholder="Category"
                label="Category"
                labelHidden
                variation="quiet"
                required
              />
              <TextField
                name="date"
                type="date"
                placeholder="Select Date"
                label="Transaction Date"
                labelHidden
                variation="quiet"
                required
              />
              <TextField
                name="memo"
                placeholder="Additional Notes (optional)"
                label="Memo"
                labelHidden
                variation="quiet"
              />
              <Button type="submit" variation="primary">
                Create Transaction
              </Button>
            </Flex>
          </View>

          <Divider />

          <Heading level={2}>Current Transactions</Heading>
          <Grid
            margin="3rem 0"
            autoFlow="column"
            justifyContent="center"
            gap="2rem"
            alignContent="center"
          >
            {transactions.map((transaction) => (
              <Flex
                key={transaction.id}
                direction="column"
                justifyContent="center"
                alignItems="center"
                gap="1rem"
                border="1px solid #ccc"
                padding="2rem"
                borderRadius="5%"
              >
                <Heading level={3}>
                  {transaction.payee} - $
                  {transaction.inflow || transaction.outflow}
                </Heading>
                <Text>Category: {transaction.category}</Text>
                <Text>Date: {transaction.date}</Text>
                {transaction.memo && (
                  <Text fontStyle="italic">Notes: {transaction.memo}</Text>
                )}
                <Button
                  variation="destructive"
                  onClick={() => deleteTransaction(transaction)}
                >
                  Delete
                </Button>
              </Flex>
            ))}
          </Grid>

          <Button onClick={signOut}>Sign Out</Button>
        </Flex>
      )}
    </Authenticator>
  );
}
