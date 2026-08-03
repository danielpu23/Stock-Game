interface InputProps {
  type?: "text" | "number" | "email" | "password";
  placeholder?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  min?: number;
  style?: React.CSSProperties;
}

export default function Input({ type = "text", placeholder, value, onChange, disabled, min, style }: InputProps) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      min={min}
      style={{
        padding: "0.75rem 1rem",
        border: "1px solid #ced4da",
        borderRadius: "6px",
        fontSize: "1rem",
        transition: "border-color 0.2s ease",
        outline: "none",
        ...style
      }}
      onFocus={(e) => e.target.style.borderColor = "#007bff"}
      onBlur={(e) => e.target.style.borderColor = "#ced4da"}
    />
  );
}