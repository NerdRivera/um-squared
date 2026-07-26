import type { CSSProperties } from "react";

export const page: CSSProperties = {
  fontFamily: "sans-serif",
  maxWidth: "640px",
  margin: "50px auto",
  padding: "0 20px",
};

export const centeredPage: CSSProperties = {
  ...page,
  textAlign: "center",
};

export const form: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "14px",
  marginTop: "20px",
};

export const label: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  fontSize: "14px",
  fontWeight: 600,
};

export const input: CSSProperties = {
  padding: "8px 10px",
  fontSize: "14px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  fontWeight: 400,
};

export const textarea: CSSProperties = {
  ...input,
  minHeight: "100px",
  resize: "vertical",
  fontFamily: "inherit",
};

export const button: CSSProperties = {
  padding: "10px 16px",
  fontSize: "14px",
  fontWeight: 600,
  border: "none",
  borderRadius: "4px",
  backgroundColor: "#7a1319",
  color: "#fff",
  cursor: "pointer",
};

export const secondaryButton: CSSProperties = {
  ...button,
  backgroundColor: "#eee",
  color: "#222",
};

export const errorText: CSSProperties = {
  color: "#b3261e",
  fontSize: "13px",
  margin: 0,
};

export const card: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: "6px",
  padding: "16px",
  marginBottom: "12px",
  textAlign: "left",
};
