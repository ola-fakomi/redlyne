interface PricingCardProps {
  plan: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}

export function PricingCard({
  plan,
  price,
  period,
  description,
  features,
  cta,
  highlighted = false,
}: PricingCardProps) {
  return (
    <div
      className={`
        flex flex-col gap-4 rounded-xl p-6
        ${highlighted
          ? 'bg-blue-600 text-white shadow-xl ring-2 ring-blue-400'
          : 'bg-white text-gray-900 shadow-md'}
      `}
    >
      <div className="flex flex-col gap-1">
        <span className={`text-sm font-semibold uppercase tracking-wide ${highlighted ? 'text-blue-100' : 'text-blue-600'}`}>
          {plan}
        </span>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold">{price}</span>
          <span className={`text-sm ${highlighted ? 'text-blue-100' : 'text-gray-500'}`}>{period}</span>
        </div>
        <p className={`text-sm ${highlighted ? 'text-blue-100' : 'text-gray-500'}`}>{description}</p>
      </div>

      <ul className="flex flex-col gap-2">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm">
            <span className={`text-base ${highlighted ? 'text-blue-200' : 'text-green-500'}`}>✓</span>
            {f}
          </li>
        ))}
      </ul>

      <button
        className={`
          mt-auto rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors
          ${highlighted
            ? 'bg-white text-blue-600 hover:bg-blue-50'
            : 'bg-blue-600 text-white hover:bg-blue-700'}
        `}
      >
        {cta}
      </button>
    </div>
  );
}
