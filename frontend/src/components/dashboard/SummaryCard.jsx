import { formatCurrency } from "../../utils/formatCurrency";

function SummaryCard({ title, value, currency }) {
    return (
        <div className="summary-card">
            <p className="summary-card-title">
                {title}
            </p>

            <p className="summary-card-value">
                {formatCurrency(value, currency)}
            </p>
        </div>
    );
}

export default SummaryCard;
