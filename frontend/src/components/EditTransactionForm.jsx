import { useState } from "react";
import api from "../api/api";

function EditTransactionForm({
    transaction,
    onTransactionUpdated,
    onCancel
}) {
    const [error, setError] = useState("");

    const [type, setType] = useState(transaction.type);
    const [amount, setAmount] = useState(transaction.amount);
    const [category, setCategory] = useState(
        transaction.category || ""
    );
    const [paymentMethod, setPaymentMethod] = useState(
        transaction.payment_method || ""
    );
    const [notes, setNotes] = useState(
        transaction.notes || ""
    );
    const [transactionDate, setTransactionDate] = useState(
        transaction.transaction_date
    );

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        try {
            await api.patch(
                `/transactions/${transaction.id}`,
                {
                    type,
                    amount: Number(amount),
                    category,
                    payment_method: paymentMethod,
                    notes,
                    transactionDate
                }
            );

            onTransactionUpdated();
        } catch (error) {
            setError(
                error.response?.data?.error ||
                "Failed to update transaction"
            );
        }
    }

    return (
        <form
            className="edit-transaction-form"
            onSubmit={handleSubmit}
        >
            <div className="edit-form-header">
                <div>
                    <h3>Edit Transaction</h3>
                    <p>Update the transaction details</p>
                </div>
            </div>

            <div className="transaction-form-grid">
                <div className="form-field">
                    <label>Type</label>

                    <select
                        value={type}
                        onChange={(event) =>
                            setType(event.target.value)
                        }
                    >
                        <option value="expense">
                            Expense
                        </option>

                        <option value="income">
                            Income
                        </option>
                    </select>
                </div>

                <div className="form-field">
                    <label>Amount</label>

                    <input
                        type="number"
                        value={amount}
                        onChange={(event) =>
                            setAmount(event.target.value)
                        }
                    />
                </div>

                <div className="form-field">
                    <label>Category</label>

                    <input
                        type="text"
                        value={category}
                        onChange={(event) =>
                            setCategory(event.target.value)
                        }
                    />
                </div>

                <div className="form-field">
                    <label>Payment Method</label>

                    <input
                        type="text"
                        value={paymentMethod}
                        onChange={(event) =>
                            setPaymentMethod(event.target.value)
                        }
                    />
                </div>

                <div className="form-field">
                    <label>Notes</label>

                    <input
                        type="text"
                        value={notes}
                        onChange={(event) =>
                            setNotes(event.target.value)
                        }
                    />
                </div>

                <div className="form-field">
                    <label>Date</label>

                    <input
                        type="date"
                        value={transactionDate}
                        onChange={(event) =>
                            setTransactionDate(event.target.value)
                        }
                    />
                </div>
            </div>

            {error && (
                <p className="form-error">
                    {error}
                </p>
            )}

            <div className="edit-form-actions">
                <button
                    className="secondary-button"
                    type="button"
                    onClick={onCancel}
                >
                    Cancel
                </button>

                <button
                    className="primary-button"
                    type="submit"
                >
                    Save Changes
                </button>
            </div>
        </form>
    );
}

export default EditTransactionForm;