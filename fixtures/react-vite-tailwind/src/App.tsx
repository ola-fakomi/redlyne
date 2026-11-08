import { NavBar } from './components/NavBar';
import { PricingCard } from './components/PricingCard';

const PLANS = [
  {
    plan: 'Starter',
    price: '$0',
    period: '/ month',
    description: 'Perfect for side projects and experiments.',
    features: ['1 project', '5 GB storage', 'Community support', 'Basic analytics'],
    cta: 'Start for free',
  },
  {
    plan: 'Pro',
    price: '$29',
    period: '/ month',
    description: 'Everything you need to ship faster.',
    features: ['Unlimited projects', '50 GB storage', 'Priority support', 'Advanced analytics', 'Custom domains'],
    cta: 'Start free trial',
    highlighted: true,
  },
  {
    plan: 'Team',
    price: '$79',
    period: '/ month',
    description: 'Collaborate without limits.',
    features: ['Unlimited projects', '200 GB storage', 'Dedicated support', 'SSO & audit logs', 'Team management'],
    cta: 'Contact sales',
  },
];

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      {/* Hero */}
      <section className="flex flex-col items-center gap-4 px-8 py-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 max-w-xl leading-tight">
          Simple pricing, powerful tools
        </h1>
        <p className="text-lg text-gray-500 max-w-md">
          Start free, upgrade when you need. No hidden fees, no surprises.
        </p>
      </section>

      {/* Pricing cards */}
      <section
        className="grid grid-cols-3 gap-6 px-8 pb-16 max-w-4xl mx-auto"
        aria-label="Pricing plans"
      >
        {PLANS.map((plan) => (
          <PricingCard key={plan.plan} {...plan} />
        ))}
      </section>

      {/* Feature row */}
      <section className="flex flex-col items-center gap-8 bg-white py-16 px-8 border-t border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900">Why teams choose Acme</h2>
        <div className="grid grid-cols-3 gap-8 max-w-4xl w-full">
          {[
            { icon: '⚡', title: 'Fast by default', body: 'Optimized for performance from day one.' },
            { icon: '🔒', title: 'Secure', body: 'SOC 2 Type II certified. Your data stays private.' },
            { icon: '📦', title: 'Batteries included', body: 'Everything you need in one platform.' },
          ].map((f) => (
            <div key={f.title} className="flex flex-col gap-2">
              <span className="text-3xl">{f.icon}</span>
              <h3 className="text-base font-semibold text-gray-900">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
