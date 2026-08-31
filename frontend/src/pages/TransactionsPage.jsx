import { useEffect, useState } from "react";
import api from "../api/api";
import CreateTransactionForm from "../components/CreateTransactionForm";
import EditTransactionForm from "../components/EditTransactionForm";
import AppLayout from "../components/layout/AppLayout";
import "../styles/transactions.css";


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
    const [selectedTransaction, setSelectedTransaction] = useState(null);

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

    useEffect(() => {
        function handleKeyDown(event) {
            if (event.key === "Escape") {
                setSelectedTransaction(null);
            }
        }

        if (selectedTransaction) {
            window.addEventListener("keydown", handleKeyDown);
        }

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [selectedTransaction]);

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
        <AppLayout>
            <div className="transactions-page">
                <header className="transactions-header">
                    <div>
                        <h1>Transactions</h1>
                        <p>Manage your income and expenses</p>
                    </div>
                </header>

                <section className="transaction-form-card">
                    <div className="transaction-form-header">
                        <h2>Add Transaction</h2>
                        <p>Record a new income or expense</p>
                    </div>

                    <CreateTransactionForm
                        onTransactionCreated={fetchTransactions}
                    />
                </section>

                <section className="filters-card">
                    <div className="filters-header">
                        <h2>Filters</h2>
                        <p>Narrow down your transactions</p>
                    </div>

                    <div className="filters-grid">
                        <div className="form-field">
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

                        <div className="form-field">
                            <label>Category</label>

                            <input
                                type="text"
                                placeholder="All categories"
                                value={categoryFilter}
                                onChange={(event) =>
                                    setCategoryFilter(event.target.value)
                                }
                            />
                        </div>

                        <div className="form-field">
                            <label>Start Date</label>

                            <input
                                type="date"
                                value={startDate}
                                onChange={(event) =>
                                    setStartDate(event.target.value)
                                }
                            />
                        </div>

                        <div className="form-field">
                            <label>End Date</label>

                            <input
                                type="date"
                                value={endDate}
                                onChange={(event) =>
                                    setEndDate(event.target.value)
                                }
                            />
                        </div>
                    </div>

                    <div className="filters-actions">
                        <button
                            className="secondary-button"
                            onClick={handleClearFilters}
                        >
                            Clear
                        </button>

                        <button
                            className="primary-button"
                            onClick={handleApplyFilters}
                        >
                            Apply Filters
                        </button>
                    </div>
                </section>

                {error && <p>{error}</p>}

                <section className="transactions-table-card">
                    <div className="transactions-table-header">
                        <div>
                            <h2>Transaction History</h2>
                            <p>Your recent income and expenses</p>
                        </div>
                    </div>

                    {error && (
                        <p className="form-error">
                            {error}
                        </p>
                    )}

                    {transactions.length === 0 ? (
                        <p className="empty-state">
                            No transactions found.
                        </p>
                    ) : (
                        <div className="table-wrapper">
                            <table className="transactions-table">
                                <thead>
                                    <tr>
                                        <th>Type</th>
                                        <th>Amount</th>
                                        <th>Category</th>
                                        <th>Payment Method</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {transactions.map((transaction) => (
                                        <tr
                                            key={transaction.id}
                                            className={
                                                editingTransaction?.id === transaction.id
                                                    ? ""
                                                    : "clickable-row"
                                            }
                                            onClick={() => {
                                                if (editingTransaction?.id !== transaction.id) {
                                                    setSelectedTransaction(transaction);
                                                }
                                            }}
                                        >
                                            {editingTransaction?.id === transaction.id ? (
                                                <td colSpan="6">
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
                                                </td>
                                            ) : (
                                                <>
                                                    <td>
                                                        <span
                                                            className={`transaction-type ${transaction.type}`}
                                                        >
                                                            {transaction.type}
                                                        </span>
                                                    </td>

                                                    <td className="transaction-amount">
                                                        {Number(transaction.amount).toLocaleString()}
                                                    </td>

                                                    <td>
                                                        {transaction.category || "Uncategorized"}
                                                    </td>

                                                    <td>
                                                        {transaction.payment_method || "-"}
                                                    </td>

                                                    <td>
                                                        {transaction.transaction_date}
                                                    </td>


                                                    <td>
                                                        <div className="table-actions">
                                                            <button
                                                                className="table-action-button"
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    setEditingTransaction(transaction);
                                                                }}
                                                            >
                                                                Edit
                                                            </button>

                                                            <button
                                                                className="table-action-button danger"
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    handleDelete(transaction.id);
                                                                }}
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                <div className="pagination">
                    <button
                        className="pagination-button"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                    >
                        Previous
                    </button>

                    <span className="pagination-info">
                        Page {page} of {totalPages}
                    </span>

                    <button
                        className="pagination-button"
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
            {selectedTransaction && (
                <div
                    className="modal-overlay"
                    onClick={() => setSelectedTransaction(null)}
                >
                    <div
                        className="transaction-modal"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="modal-header">
                            <div>
                                <h2>Transaction Details</h2>
                                <p>View transaction information</p>
                            </div>

                            <button
                                className="modal-close"
                                onClick={() => setSelectedTransaction(null)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="transaction-details-grid">
                            <div className="detail-item">
                                <span className="detail-label">
                                    Type
                                </span>

                                <span
                                    className={`transaction-type ${selectedTransaction.type}`}
                                >
                                    {selectedTransaction.type}
                                </span>
                            </div>

                            <div className="detail-item">
                                <span className="detail-label">
                                    Amount
                                </span>

                                <span className="detail-value">
                                    {Number(
                                        selectedTransaction.amount
                                    ).toLocaleString()}
                                </span>
                            </div>

                            <div className="detail-item">
                                <span className="detail-label">
                                    Category
                                </span>

                                <span className="detail-value">
                                    {selectedTransaction.category ||
                                        "Uncategorized"}
                                </span>
                            </div>

                            <div className="detail-item">
                                <span className="detail-label">
                                    Payment Method
                                </span>

                                <span className="detail-value">
                                    {selectedTransaction.payment_method ||
                                        "-"}
                                </span>
                            </div>

                            <div className="detail-item">
                                <span className="detail-label">
                                    Date
                                </span>

                                <span className="detail-value">
                                    {selectedTransaction.transaction_date}
                                </span>
                            </div>
                        </div>

                        <div className="transaction-note">
                            <span className="detail-label">
                                Note
                            </span>

                            <p>
                                {selectedTransaction.notes ||
                                    "No note for this transaction."}
                            </p>
                            
                        </div>
                        
                    </div>
                </div>
            )}
        </AppLayout >
    );
}

export default TransactionsPage;