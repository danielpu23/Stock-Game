interface InputProps {
  type?: "text" | "number" | "email" | "password";
  placeholder?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  min?: number;
  style?: React.CSSProperties;
  'data-testid'?: string;
  id?: string;
  required?: boolean;
  className?: string;
}

export default function Input({ type = "text", placeholder, value, onChange, disabled, min, style, 'data-testid': dataTestId, id, required, className }: InputProps) {
  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      min={min}
      required={required}
      data-testid={dataTestId}
      className={className ? `input ${className}` : "input"}
      style={style}
    />
  );
}