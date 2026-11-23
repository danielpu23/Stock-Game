interface InputProps {
  type?: "text" | "number" | "email" | "password";
  placeholder?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  min?: number;
  style?: React.CSSProperties;
  'data-testid'?: string;
}

export default function Input({ type = "text", placeholder, value, onChange, disabled, min, style, 'data-testid': dataTestId }: InputProps) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      min={min}
      data-testid={dataTestId}
      className="input"
      style={style}
    />
  );
}