export function Three() {
  const colour = typeof window !== "undefined" ? "red" : "blue";

  return (
    <div>
      <h1>Three</h1>
      <p>{colour}</p>
    </div>
  );
}
