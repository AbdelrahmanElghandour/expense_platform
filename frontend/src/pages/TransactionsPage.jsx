import { useEffect, useState } from "react";
import api from "../api/api";
import CreateTransactionForm from "../components/CreateTransactionForm";
import EditTransactionForm from "../components/EditTransactionForm";


function TransactionsPage() {
    const [transactions, setTransactions] = useState([]);
    const [error, setError] = useState("");
    const [editingTransaction, setEditingTransaction] = useState(null);

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Filters
    const [typeFilter, setTypeFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Used to trigger a new fetch when Apply Filters is clicked
    const [appliedFilters, setAppliedFilters] = useState({
        type: "",
        category: "",
        startDate: "",
        endDate: ""
    });

    async function fetchTransactions() {
        try {
            setError("");

            const response = await api.get("/transactions", {
                params: {
                    page,
                    limit: 5,
                    ...(appliedFilters.type && {
                        type: appliedFilters.type
                    }),
                    ...(appliedFilters.category && {
                        category: appliedFilters.category
                    }),
                    ...(appliedFilters.startDate && {
                        startDate: appliedFilters.startDate
                    }),
                    ...(appliedFilters.endDate && {
                        endDate: appliedFilters.endDate
                    })
                }
            });

            setTransactions(response.data.transactions);
            setTotalPages(response.data.totalPages);

            if (
                response.data.totalPages > 0 &&
                page > response.data.totalPages
            ) {
                setPage(response.data.totalPages);
            }
        } catch (error) {
            setError(
                error.response?.data?.error ||
                "Failed to load transactions"
            );
        }
    }
    useEffect(() => {
        fetchTransactions();
    }, [page, appliedFilters]);

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

    function handleApplyFilters() {
        setPage(1);

        setAppliedFilters({
            type: typeFilter,
            category: categoryFilter,
            startDate,
            endDate
        });
    }
    function handleClearFilters() {
        setTypeFilter("");
        setCategoryFilter("");
        setStartDate("");
        setEndDate("");

        setPage(1);

        setAppliedFilters({
            type: "",
            category: "",
            startDate: "",
            endDate: ""
        });
    }
    return (
        <div>
            <h1>Transactions</h1>

            <CreateTransactionForm
                onTransactionCreated={fetchTransactions}
            />

            <hr />

            <h2>Filters</h2>

            <div>
                <label>Type</label>

                <select
                    value={typeFilter}
                    onChange={(event) =>
                        setTypeFilter(event.target.value)
                    }
                >
                    <option value="">All types</option>
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                </select>
            </div>

            <div>
                <label>Category</label>

                <input
                    type="text"
                    placeholder="Category"
                    value={categoryFilter}
                    onChange={(event) =>
                        setCategoryFilter(event.target.value)
                    }
                />
            </div>

            <div>
                <label>Start Date</label>

                <input
                    type="date"
                    value={startDate}
                    onChange={(event) =>
                        setStartDate(event.target.value)
                    }
                />
            </div>

            <div>
                <label>End Date</label>

                <input
                    type="date"
                    value={endDate}
                    onChange={(event) =>
                        setEndDate(event.target.value)
                    }
                />
            </div>

            <button onClick={handleApplyFilters}>
                Apply Filters
            </button>
            <button onClick={handleClearFilters}>
                Clear Filters
            </button>
            <hr />

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
                                    <p>
                                        Type: {transaction.type}
                                    </p>

                                    <p>
                                        Amount: {transaction.amount}
                                    </p>

                                    <p>
                                        Category:{" "}
                                        {transaction.category ||
                                            "Uncategorized"}
                                    </p>

                                    <p>
                                        Date:{" "}
                                        {transaction.transaction_date}
                                    </p>

                                    {transaction.notes && (
                                        <p>
                                            Note: {transaction.notes}
                                        </p>
                                    )}

                                    <button
                                        onClick={() =>
                                            setEditingTransaction(
                                                transaction
                                            )
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

            <div>
                <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                >
                    Previous
                </button>

                <span>
                    Page {page} of {totalPages}
                </span>

                <button
                    onClick={() => setPage(page + 1)}
                    disabled={
                        totalPages === 0 ||
                        page === totalPages
                    }
                >
                    Next
                </button>
            </div>
        </div>
    );
}

export default TransactionsPage;