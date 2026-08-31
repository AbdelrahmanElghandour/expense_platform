function SummaryCard({ title, value }) {
    return (
        <div className="summary-card">
            <p className="summary-card-title">
                {title}
            </p>

            <p className="summary-card-value">
                {value}
            </p>
        </div>
    );
}

export default SummaryCard;