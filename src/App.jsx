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

/**
 * @type {import('aws-amplify/data').Client<import('../amplify/data/resource').Schema>}
 */

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
    const { data } = await client.models.Transaction.list();
    // data holds an array of Transaction objects
    setTransactions(data);
  }

  async function createTransaction(event) {
    event.preventDefault();
    const form = new FormData(event.target);

    const { data: newTransaction } = await client.models.Transaction.create({
      type: form.get("type"),
      amount: parseFloat(form.get("amount")),
      category: form.get("category"),
      // The date input returns something like "2025-03-10"
      date: form.get("date"),
      notes: form.get("notes"),
    });

    console.log("Created transaction:", newTransaction);
    fetchTransactions();
    event.target.reset();
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
            <Flex direction="column" gap="2rem" padding="2rem">
              <TextField
                name="type"
                placeholder="Transaction Type (income/expense)"
                label="Type"
                labelHidden
                variation="quiet"
                required
              />
              <TextField
                name="amount"
                placeholder="Amount"
                label="Amount"
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
                name="notes"
                placeholder="Additional Notes (optional)"
                label="Notes"
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
                  {transaction.type} - ${transaction.amount}
                </Heading>
                <Text>Category: {transaction.category}</Text>
                <Text>Date: {transaction.date}</Text>
                {transaction.notes && (
                  <Text fontStyle="italic">Notes: {transaction.notes}</Text>
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
