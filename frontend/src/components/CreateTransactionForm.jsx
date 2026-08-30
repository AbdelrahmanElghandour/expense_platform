import { useState } from "react";
import api from "../api/api";

function CreateTransactionForm({ onTransactionCreated }) {
    const [error, setError] = useState("");
    const [type, setType] = useState("expense");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [payment_method, setPaymentMethod] = useState("");
    const [notes, setNotes] = useState("");
    const [transactionDate, setTransactionDate] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        try {
            await api.post("/transactions", {
                type,
                amount: Number(amount),
                category,
                payment_method: payment_method,
                notes,
                transactionDate
            });
            onTransactionCreated();
        } catch (error) {
            setError(
                error.response?.data?.error ||
                "Failed to create transaction"
            );
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Type</label>

                <select
                    value={type}
                    onChange={(event) =>
                        setType(event.target.value)
                    }
                >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                </select>
            </div>

            <div>
                <label>Amount</label>

                <input
                    type="number"
                    value={amount}
                    onChange={(event) =>
                        setAmount(event.target.value)
                    }
                />
            </div>

            <div>
                <label>Category</label>

                <input
                    type="text"
                    value={category}
                    onChange={(event) =>
                        setCategory(event.target.value)
                    }
                />
            </div>

            <div>
                <label>Payment Method</label>

                <input
                    type="text"
                    value={payment_method}
                    onChange={(event) =>
                        setPaymentMethod(event.target.value)
                    }
                />
            </div>

            <div>
                <label>Notes</label>

                <input
                    type="text"
                    value={notes}
                    onChange={(event) =>
                        setNotes(event.target.value)
                    }
                />
            </div>

            <div>
                <label>Date</label>

                <input
                    type="date"
                    value={transactionDate}
                    onChange={(event) =>
                        setTransactionDate(event.target.value)
                    }
                />
            </div>

            {error && <p>{error}</p>}

            <button type="submit">
                Add Transaction
            </button>
        </form>
    );
}

export default CreateTransactionForm;