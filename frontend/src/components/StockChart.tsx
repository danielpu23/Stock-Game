interface StockChartProps {
  symbol: string;
  currentPrice: number;
  previousPrice?: number;
}

export default function StockChart({ symbol, currentPrice, previousPrice }: StockChartProps) {
  const change = previousPrice ? currentPrice - previousPrice : 0;
  const changePercent = previousPrice ? (change / previousPrice) * 100 : 0;
  const isPositive = change >= 0;

  return (
    <div style={{ 
      padding: "1rem", 
      border: "1px solid #ddd", 
      borderRadius: "8px", 
      marginTop: "1rem",
      backgroundColor: "#f8f9fa"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0 }}>{symbol}</h3>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
            ${currentPrice.toFixed(2)}
          </div>
          <div style={{ 
            color: isPositive ? "green" : "red",
            fontSize: "0.9rem"
          }}>
            {isPositive ? "+" : ""}{change.toFixed(2)} ({isPositive ? "+" : ""}{changePercent.toFixed(2)}%)
          </div>
        </div>
      </div>
      
      {/* Simple visual representation */}
      <div style={{ marginTop: "1rem", height: "100px", position: "relative" }}>
        <div style={{
          position: "absolute",
          left: "50%",
          top: "0",
          bottom: "0",
          width: "2px",
          backgroundColor: "#ddd"
        }}></div>
        
        {/* Price bar */}
        <div style={{
          position: "absolute",
          left: isPositive ? "50%" : `${50 - Math.min(Math.abs(changePercent), 50)}%`,
          right: isPositive ? `${50 - Math.min(Math.abs(changePercent), 50)}%` : "50%",
          top: "20%",
          bottom: "20%",
          backgroundColor: isPositive ? "#28a745" : "#dc3545",
          borderRadius: "4px",
          transition: "all 0.3s ease"
        }}></div>
        
        {/* Previous price marker */}
        {previousPrice && (
          <div style={{
            position: "absolute",
            left: "50%",
            top: "15%",
            bottom: "15%",
            width: "2px",
            backgroundColor: "#666"
          }}></div>
        )}
      </div>
      
      <div style={{ 
        marginTop: "0.5rem", 
        fontSize: "0.8rem", 
        color: "#666",
        textAlign: "center"
      }}>
        Real-time price from Finnhub API
      </div>
    </div>
  );
}