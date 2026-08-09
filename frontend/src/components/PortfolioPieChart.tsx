import { useState, useEffect } from "react";
import { getStockPrice } from "../api/stockApi";

interface PortfolioData {
  label: string;
  value: number;
  color: string;
}

interface PortfolioPieChartProps {
  cashBalance: number;
  holdings: Array<{ symbol: string; quantity: number; currentPrice?: number }>;
}

// Generate colors for the pie chart
const generateColors = (count: number): string[] => {
  const colors = [
    "#007bff", "#28a745", "#dc3545", "#ffc107", "#17a2b8",
    "#6610f2", "#e83e8c", "#fd7e14", "#20c997", "#6f42c1"
  ];
  return colors.slice(0, count);
};

export default function PortfolioPieChart({ cashBalance, holdings }: PortfolioPieChartProps) {
  const [stockPrices, setStockPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Fetch current prices for all holdings
  useEffect(() => {
    async function fetchPrices() {
      try {
        const prices: Record<string, number> = {};
        const promises = holdings.map(async (holding) => {
          try {
            const price = await getStockPrice(holding.symbol.toUpperCase());
            prices[holding.symbol.toUpperCase()] = price;
          } catch (error) {
            console.error(`Failed to fetch price for ${holding.symbol}:`, error);
            prices[holding.symbol.toUpperCase()] = 0;
          }
        });
        
        await Promise.all(promises);
        setStockPrices(prices);
      } catch (error) {
        console.error("Error fetching stock prices:", error);
      } finally {
        setLoading(false);
      }
    }

    if (holdings.length > 0) {
      fetchPrices();
    } else {
      setLoading(false);
    }
  }, [holdings]);

  // Calculate portfolio data
  const portfolioData: PortfolioData[] = [
    { label: "Cash", value: cashBalance, color: "#6c757d" }
  ];

  // Add holdings with their current values
  holdings.forEach((holding, index) => {
    const currentPrice = stockPrices[holding.symbol.toUpperCase()] || holding.currentPrice || 0;
    const holdingValue = holding.quantity * currentPrice;
    if (holdingValue > 0) {
      portfolioData.push({
        label: holding.symbol.toUpperCase(),
        value: holdingValue,
        color: generateColors(holdings.length)[index]
      });
    }
  });

  const totalValue = portfolioData.reduce((sum, item) => sum + item.value, 0);

  // Calculate pie slices
  let cumulativePercent = 0;
  const slices = portfolioData.map((item) => {
    const percent = (item.value / totalValue) * 100;
    const startPercent = cumulativePercent;
    cumulativePercent += percent;
    return {
      ...item,
      percent,
      startPercent,
      endPercent: cumulativePercent
    };
  }).filter(slice => slice.percent > 0); // Remove empty slices

  // Create SVG path for pie slice
  const createPieSlice = (startPercent: number, endPercent: number): string => {
    const startAngle = (startPercent / 100) * 2 * Math.PI - Math.PI / 2;
    const endAngle = (endPercent / 100) * 2 * Math.PI - Math.PI / 2;
    
    const x1 = 50 + 50 * Math.cos(startAngle);
    const y1 = 50 + 50 * Math.sin(startAngle);
    const x2 = 50 + 50 * Math.cos(endAngle);
    const y2 = 50 + 50 * Math.sin(endAngle);
    
    const largeArcFlag = endPercent - startPercent > 50 ? 1 : 0;
    
    if (endPercent - startPercent === 100) {
      // Full circle
      return `M 50 50 m -50 0 a 50 50 0 1 0 100 0 a 50 50 0 1 0 -100 0`;
    }
    
    return `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
        <p>Loading portfolio data...</p>
      </div>
    );
  }

  if (totalValue === 0) {
    return (
      <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
        <p>No portfolio data to display</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Pie Chart */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <svg width="200" height="200" viewBox="0 0 100 100">
          {slices.map((slice, index) => (
            <path
              key={index}
              d={createPieSlice(slice.startPercent, slice.endPercent)}
              fill={slice.color}
              stroke="white"
              strokeWidth="0.5"
            />
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "center" }}>
        {slices.map((slice, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.9rem"
            }}
          >
            <div
              style={{
                width: "16px",
                height: "16px",
                backgroundColor: slice.color,
                borderRadius: "3px"
              }}
            />
            <span style={{ color: "#333" }}>
              {slice.label}: {slice.percent.toFixed(1)}% (${slice.value.toFixed(2)})
            </span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div style={{ textAlign: "center", fontSize: "1.1rem", fontWeight: "bold", color: "#333" }}>
        Total Portfolio Value: ${totalValue.toFixed(2)}
      </div>
    </div>
  );
}