import { useEffect, useState } from "react";
import api from "../api/api";
import CreateTransactionForm from "../components/CreateTransactionForm";
import EditTransactionForm from "../components/EditTransactionForm";

function TransactionsPage() {
    const [transactions, setTransactions] = useState([]);
    const [error, setError] = useState("");
    const [editingTransaction, setEditingTransaction] = useState(null);

    async function fetchTransactions() {
        try {
            const response = await api.get("/transactions");

            setTransactions(response.data.transactions);
        } catch (error) {
            setError(
                error.response?.data?.error ||
                "Failed to load transactions"
            );
        }
    }
    useEffect(() => {
        fetchTransactions();
    }, []);
    async function handleDelete(transactionId) {
        try {
            await api.delete(`/transactions/${transactionId}`);
            fetchTransactions();
        } catch (error) {
            setError(
                error.response?.data?.error ||
                "Failed to delete transaction"
            );
        }
    }

    return (
        <div>
            <h1>Transactions</h1>

            <CreateTransactionForm onTransactionCreated={fetchTransactions} />
            {error && <p>{error}</p>}

            {transactions.length === 0 ? (
                <p>No transactions found.</p>
            ) : (
                <div>
                    {transactions.map((transaction) => (
                        <div key={transaction.id}>
                            {editingTransaction?.id === transaction.id ? (
                                <EditTransactionForm
                                    transaction={transaction}
                                    onTransactionUpdated={async () => {
                                        await fetchTransactions();
                                        setEditingTransaction(null);
                                    }}
                                    onCancel={() => {
                                        setEditingTransaction(null);
                                    }}
                                />
                            ) : (
                                <>
                                    <p>Type: {transaction.type}</p>
                                    <p>Amount: {transaction.amount}</p>

                                    <p>
                                        Category:{" "}
                                        {transaction.category || "Uncategorized"}
                                    </p>

                                    <p>
                                        Date: {transaction.transaction_date}
                                    </p>

                                    {transaction.notes && (
                                        <p>Note: {transaction.notes}</p>
                                    )}

                                    <button
                                        onClick={() =>
                                            setEditingTransaction(transaction)
                                        }
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={() =>
                                            handleDelete(transaction.id)
                                        }
                                    >
                                        Delete
                                    </button>
                                </>
                            )}

                            <hr />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default TransactionsPage;