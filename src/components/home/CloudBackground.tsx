export function CloudBackground({ className }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className ?? ""}`} aria-hidden="true">
      <svg
        className="absolute top-[8%] -left-10 w-[700px] h-[200px] opacity-[0.18] animate-cloud-drift"
        viewBox="0 0 700 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse cx="180" cy="120" rx="120" ry="60" fill="#A8D7FF" />
        <ellipse cx="260" cy="90" rx="100" ry="70" fill="#D8EEFF" />
        <ellipse cx="340" cy="100" rx="140" ry="55" fill="#A8D7FF" />
        <ellipse cx="260" cy="110" rx="160" ry="40" fill="#EDF8FF" />
      </svg>
      <svg
        className="absolute top-[40%] -right-32 w-[500px] h-[160px] opacity-[0.14] animate-cloud-drift-slow"
        viewBox="0 0 500 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse cx="120" cy="100" rx="90" ry="50" fill="#A8D7FF" />
        <ellipse cx="200" cy="70" rx="110" ry="55" fill="#D8EEFF" />
        <ellipse cx="280" cy="80" rx="100" ry="45" fill="#EDF8FF" />
        <ellipse cx="200" cy="90" rx="140" ry="35" fill="#F8FCFF" />
      </svg>
      <svg
        className="absolute top-[65%] -left-20 w-[600px] h-[180px] opacity-[0.12] animate-cloud-drift-slow"
        style={{ animationDirection: "reverse" }}
        viewBox="0 0 600 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse cx="130" cy="110" rx="100" ry="50" fill="#D8EEFF" />
        <ellipse cx="230" cy="80" rx="120" ry="60" fill="#A8D7FF" />
        <ellipse cx="320" cy="90" rx="110" ry="45" fill="#EDF8FF" />
        <ellipse cx="250" cy="100" rx="150" ry="40" fill="#F8FCFF" />
      </svg>
    </div>
  );
}
