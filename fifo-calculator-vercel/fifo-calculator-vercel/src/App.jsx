import React, { useMemo, useState } from "react";

const Icon = ({ children, className = "" }) => (
  <span className={`inline-flex items-center justify-center ${className}`} aria-hidden="true">
    {children}
  </span>
);

const Icons = {
  calculator: (props) => <Icon {...props}>🧮</Icon>,
  clock: (props) => <Icon {...props}>⏱️</Icon>,
  dollar: (props) => <Icon {...props}>💰</Icon>,
  hammer: (props) => <Icon {...props}>⛏️</Icon>,
  shield: (props) => <Icon {...props}>✅</Icon>,
  trend: (props) => <Icon {...props}>📈</Icon>,
  calendar: (props) => <Icon {...props}>📅</Icon>,
  arrow: (props) => <Icon {...props}>›</Icon>,
  target: (props) => <Icon {...props}>🎯</Icon>,
};

const formatMoney = (value) => {
  const number = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(number);
};

const clamp = (value, min = 0) => Math.max(min, Number(value) || 0);

function estimateTaxAU(incomeValue) {
  const income = clamp(incomeValue);
  const medicare = income > 24276 ? income * 0.02 : 0;
  let tax = 0;

  if (income <= 18200) tax = 0;
  else if (income <= 45000) tax = (income - 18200) * 0.16;
  else if (income <= 135000) tax = 4288 + (income - 45000) * 0.3;
  else if (income <= 190000) tax = 31288 + (income - 135000) * 0.37;
  else tax = 51638 + (income - 190000) * 0.45;

  return Math.max(0, tax + medicare);
}

function runCalculatorTests() {
  const approxEqual = (actual, expected, tolerance = 1) => Math.abs(actual - expected) <= tolerance;

  console.assert(formatMoney(120000) === "$120,000", "formatMoney should format AUD without decimals");
  console.assert(clamp("55") === 55, "clamp should convert numeric strings");
  console.assert(clamp("bad") === 0, "clamp should convert invalid values to 0");
  console.assert(estimateTaxAU(18200) === 0, "income at tax-free threshold should have no tax/Medicare in this simplified model");
  console.assert(approxEqual(estimateTaxAU(45000), 4288 + 900), "tax estimate should match the 45k bracket plus Medicare");
  console.assert(approxEqual(estimateTaxAU(120000), 4288 + 75000 * 0.3 + 2400), "tax estimate should match the 120k bracket plus Medicare");
  console.assert(approxEqual(estimateTaxAU(200000), 51638 + 10000 * 0.45 + 4000), "tax estimate should match the 200k bracket plus Medicare");
}

runCalculatorTests();

function Button({ href, children, variant = "dark", className = "" }) {
  const styles =
    variant === "light"
      ? "bg-[#F97316] text-white hover:bg-[#EA580C]"
      : variant === "outline"
        ? "border border-white/20 bg-transparent text-white hover:bg-[#F97316]/10"
        : "bg-[#F97316] text-white hover:bg-[#EA580C]";

  return (
    <a
      href={href}
      className={`inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-bold shadow-sm transition ${styles} ${className}`}
    >
      {children}
    </a>
  );
}

function Field({ label, value, onChange, suffix, prefix = "", type = "number" }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <div className="flex items-center rounded-2xl border border-[#CBD5E1] bg-white px-4 shadow-sm focus-within:border-[#F97316]">
        {prefix && <span className="mr-2 text-[#64748B]">{prefix}</span>}
        <input
          type={type}
          value={value}
          min="0"
          onChange={(event) => onChange(event.target.value)}
          className="w-full bg-transparent py-3 text-base outline-none"
        />
        {suffix && <span className="ml-2 text-sm text-[#64748B]">{suffix}</span>}
      </div>
    </label>
  );
}

function ResultCard({ title, value, detail }) {
  return (
    <div className="min-w-0 rounded-2xl bg-[#111827] p-5 text-white shadow-lg">
      <p className="text-sm text-slate-200">{title}</p>
      <p className="mt-1 break-words text-2xl font-bold tracking-tight sm:text-3xl lg:text-[1.7rem] xl:text-3xl">{value}</p>
      {detail && <p className="mt-2 break-words text-sm leading-6 text-slate-200">{detail}</p>}
    </div>
  );
}

function ToolShell({ id, icon: ToolIcon, title, description, children }) {
  return (
    <section id={id} className="scroll-mt-24 overflow-hidden rounded-3xl border border-[#CBD5E1] bg-white shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[0.65fr_1.35fr]">
        <div className="bg-[#111827] p-6 text-white md:p-8">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F97316]/15 text-2xl">
            <ToolIcon />
          </div>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h2>
          <p className="mt-3 text-slate-200">{description}</p>
        </div>
        <div className="p-6 md:p-8">{children}</div>
      </div>
    </section>
  );
}

function RosterSalaryCalculator() {
  const [dayRate, setDayRate] = useState(750);
  const [daysOn, setDaysOn] = useState(14);
  const [daysOff, setDaysOff] = useState(7);

  const result = useMemo(() => {
    const cycleDays = clamp(daysOn) + clamp(daysOff);
    const cycles = cycleDays ? 365 / cycleDays : 0;
    const annualWorkDays = clamp(daysOn) * cycles;
    const gross = annualWorkDays * clamp(dayRate);
    const tax = estimateTaxAU(gross);
    return { annualWorkDays, gross, tax, net: gross - tax };
  }, [dayRate, daysOn, daysOff]);

  return (
    <ToolShell
      id="roster-salary"
      icon={Icons.calendar}
      title="Roster Salary Calculator"
      description="Estimate annual gross and take-home pay from a FIFO roster such as 2:1, 8:6, 7:7, or 2:2."
    >
      <div className="grid gap-5 md:grid-cols-3">
        <Field label="Day rate" value={dayRate} onChange={setDayRate} prefix="$" />
        <Field label="Days on" value={daysOn} onChange={setDaysOn} suffix="days" />
        <Field label="Days off" value={daysOff} onChange={setDaysOff} suffix="days" />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <ResultCard title="Estimated annual gross" value={formatMoney(result.gross)} detail={`${Math.round(result.annualWorkDays)} paid work days/year`} />
        <ResultCard title="Estimated tax + Medicare" value={formatMoney(result.tax)} detail="Approximate only" />
        <ResultCard title="Estimated take-home" value={formatMoney(result.net)} detail={`${formatMoney(result.net / 52)} per week average`} />
      </div>
    </ToolShell>
  );
}

function AfterTaxEstimator() {
  const [income, setIncome] = useState(120000);
  const result = useMemo(() => {
    const gross = clamp(income);
    const tax = estimateTaxAU(gross);
    return { gross, tax, net: gross - tax };
  }, [income]);

  return (
    <ToolShell
      id="after-tax"
      icon={Icons.shield}
      title="After-Tax Estimator"
      description="Quickly estimate annual, monthly, fortnightly, and weekly take-home pay for an Australian income."
    >
      <Field label="Annual gross income" value={income} onChange={setIncome} prefix="$" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ResultCard title="Annual take-home" value={formatMoney(result.net)} />
        <ResultCard title="Monthly" value={formatMoney(result.net / 12)} />
        <ResultCard title="Fortnightly" value={formatMoney(result.net / 26)} />
        <ResultCard title="Weekly" value={formatMoney(result.net / 52)} />
      </div>
    </ToolShell>
  );
}

function AnnualIncomePredictor() {
  const [weeklyNet, setWeeklyNet] = useState(1800);
  const [weeksWorked, setWeeksWorked] = useState(42);
  const [bonus, setBonus] = useState(5000);

  const result = useMemo(() => {
    const net = clamp(weeklyNet) * clamp(weeksWorked) + clamp(bonus);
    const grossApprox = net / 0.68;
    return { net, grossApprox };
  }, [weeklyNet, weeksWorked, bonus]);

  return (
    <ToolShell
      id="annual-income"
      icon={Icons.trend}
      title="Annual Income Predictor"
      description="Forecast your yearly FIFO earnings when your work weeks, bonuses, or shutdown periods change."
    >
      <div className="grid gap-5 md:grid-cols-3">
        <Field label="Average weekly take-home" value={weeklyNet} onChange={setWeeklyNet} prefix="$" />
        <Field label="Weeks worked per year" value={weeksWorked} onChange={setWeeksWorked} suffix="weeks" />
        <Field label="Bonuses / allowances" value={bonus} onChange={setBonus} prefix="$" />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <ResultCard title="Projected annual take-home" value={formatMoney(result.net)} />
        <ResultCard title="Rough gross equivalent" value={formatMoney(result.grossApprox)} detail="Estimated from net income" />
      </div>
    </ToolShell>
  );
}

function SuperCalculator() {
  const [income, setIncome] = useState(120000);
  const [rate, setRate] = useState(12);
  const [extra, setExtra] = useState(0);

  const result = useMemo(() => {
    const employer = clamp(income) * (clamp(rate) / 100);
    const total = employer + clamp(extra) * 12;
    return { employer, total };
  }, [income, rate, extra]);

  return (
    <ToolShell
      id="super"
      icon={Icons.dollar}
      title="Super Calculator"
      description="Estimate annual employer super contributions plus any extra monthly contributions."
    >
      <div className="grid gap-5 md:grid-cols-3">
        <Field label="Annual salary" value={income} onChange={setIncome} prefix="$" />
        <Field label="Super rate" value={rate} onChange={setRate} suffix="%" />
        <Field label="Extra monthly contribution" value={extra} onChange={setExtra} prefix="$" />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <ResultCard title="Employer super/year" value={formatMoney(result.employer)} />
        <ResultCard title="Total super/year" value={formatMoney(result.total)} detail="Employer + extra contributions" />
      </div>
    </ToolShell>
  );
}

function OvertimeEstimator() {
  const [hourlyRate, setHourlyRate] = useState(55);
  const [normalHours, setNormalHours] = useState(38);
  const [otHours, setOtHours] = useState(12);
  const [multiplier, setMultiplier] = useState(1.5);

  const result = useMemo(() => {
    const base = clamp(hourlyRate) * clamp(normalHours);
    const overtime = clamp(hourlyRate) * clamp(otHours) * clamp(multiplier);
    const weekly = base + overtime;
    return { base, overtime, weekly, annual: weekly * 52 };
  }, [hourlyRate, normalHours, otHours, multiplier]);

  return (
    <ToolShell
      id="overtime"
      icon={Icons.clock}
      title="Overtime Estimator"
      description="Estimate weekly overtime earnings using your hourly rate, overtime hours, and multiplier."
    >
      <div className="grid gap-5 md:grid-cols-4">
        <Field label="Hourly rate" value={hourlyRate} onChange={setHourlyRate} prefix="$" />
        <Field label="Base hours" value={normalHours} onChange={setNormalHours} suffix="hrs" />
        <Field label="Overtime hours" value={otHours} onChange={setOtHours} suffix="hrs" />
        <Field label="OT multiplier" value={multiplier} onChange={setMultiplier} suffix="x" />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <ResultCard title="Base weekly pay" value={formatMoney(result.base)} />
        <ResultCard title="Overtime pay" value={formatMoney(result.overtime)} />
        <ResultCard title="Weekly gross total" value={formatMoney(result.weekly)} detail={`${formatMoney(result.annual)} annualised`} />
      </div>
    </ToolShell>
  );
}

function HourlyAnnualConverter() {
  const [hourly, setHourly] = useState(60);
  const [hours, setHours] = useState(50);
  const [weeks, setWeeks] = useState(46);

  const result = useMemo(() => {
    const annual = clamp(hourly) * clamp(hours) * clamp(weeks);
    const tax = estimateTaxAU(annual);
    return { annual, net: annual - tax, dayRate: clamp(hourly) * 12 };
  }, [hourly, hours, weeks]);

  return (
    <ToolShell
      id="hourly-converter"
      icon={Icons.calculator}
      title="Hourly-to-Annual Converter"
      description="Convert hourly pay into weekly, annual, and approximate take-home income."
    >
      <div className="grid gap-5 md:grid-cols-3">
        <Field label="Hourly rate" value={hourly} onChange={setHourly} prefix="$" />
        <Field label="Hours per week" value={hours} onChange={setHours} suffix="hrs" />
        <Field label="Weeks worked per year" value={weeks} onChange={setWeeks} suffix="weeks" />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <ResultCard title="Weekly gross" value={formatMoney(clamp(hourly) * clamp(hours))} />
        <ResultCard title="Annual gross" value={formatMoney(result.annual)} />
        <ResultCard title="Annual take-home" value={formatMoney(result.net)} detail={`Approx day rate: ${formatMoney(result.dayRate)}`} />
      </div>
    </ToolShell>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-[#CBD5E1] bg-white px-4 py-3 text-base shadow-sm outline-none focus:border-[#F97316]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function SavingsProjectionCalculator() {
  const [goalAmount, setGoalAmount] = useState(50000);
  const [timeframe, setTimeframe] = useState(12);
  const [timeframeUnit, setTimeframeUnit] = useState("months");
  const [annualSalary, setAnnualSalary] = useState(120000);
  const [rent, setRent] = useState(1800);
  const [food, setFood] = useState(650);
  const [transport, setTransport] = useState(350);
  const [debt, setDebt] = useState(300);
  const [subscriptions, setSubscriptions] = useState(80);
  const [other, setOther] = useState(600);
  const [currentSavings, setCurrentSavings] = useState(5000);

  const result = useMemo(() => {
    const months =
      timeframeUnit === "weeks"
        ? clamp(timeframe) / 4.345
        : timeframeUnit === "years"
          ? clamp(timeframe) * 12
          : clamp(timeframe);

    const safeMonths = Math.max(months, 1);
    const netAnnual = clamp(annualSalary) - estimateTaxAU(annualSalary);
    const monthlyIncome = netAnnual / 12;
    const monthlyExpenses = clamp(rent) + clamp(food) + clamp(transport) + clamp(debt) + clamp(subscriptions) + clamp(other);
    const monthlyAvailable = monthlyIncome - monthlyExpenses;
    const remainingGoal = Math.max(clamp(goalAmount) - clamp(currentSavings), 0);
    const requiredMonthlySaving = remainingGoal / safeMonths;
    const surplusAfterGoal = monthlyAvailable - requiredMonthlySaving;
    const projectedSavings = clamp(currentSavings) + Math.max(monthlyAvailable, 0) * safeMonths;
    const shortfall = Math.max(clamp(goalAmount) - projectedSavings, 0);
    const successRate = clamp(goalAmount) > 0 ? Math.min(100, (projectedSavings / clamp(goalAmount)) * 100) : 100;
    const status = surplusAfterGoal >= 0 ? "On track" : "Needs adjustment";

    return {
      months: safeMonths,
      netAnnual,
      monthlyIncome,
      monthlyExpenses,
      monthlyAvailable,
      remainingGoal,
      requiredMonthlySaving,
      surplusAfterGoal,
      projectedSavings,
      shortfall,
      successRate,
      status,
    };
  }, [goalAmount, timeframe, timeframeUnit, annualSalary, rent, food, transport, debt, subscriptions, other, currentSavings]);

  const savingTips = [
    ["Rent / board", rent],
    ["Food / groceries", food],
    ["Transport", transport],
    ["Debt repayments", debt],
    ["Subscriptions", subscriptions],
    ["Other spending", other],
  ].sort((a, b) => clamp(b[1]) - clamp(a[1]));

  return (
    <ToolShell
      id="savings-projection"
      icon={Icons.target}
      title="Savings Goal Projection"
      description="Set a money goal, choose your timeframe, add salary and expenses, then see exactly how much you need to save each month."
    >
      <div className="grid gap-5 md:grid-cols-4">
        <Field label="Savings goal" value={goalAmount} onChange={setGoalAmount} prefix="$" />
        <Field label="Current savings" value={currentSavings} onChange={setCurrentSavings} prefix="$" />
        <Field label="Timeframe" value={timeframe} onChange={setTimeframe} />
        <SelectField
          label="Timeframe type"
          value={timeframeUnit}
          onChange={setTimeframeUnit}
          options={[
            { value: "weeks", label: "Weeks" },
            { value: "months", label: "Months" },
            { value: "years", label: "Years" },
          ]}
        />
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        <Field label="Annual salary before tax" value={annualSalary} onChange={setAnnualSalary} prefix="$" />
        <Field label="Monthly rent / board" value={rent} onChange={setRent} prefix="$" />
        <Field label="Monthly food / groceries" value={food} onChange={setFood} prefix="$" />
        <Field label="Monthly transport" value={transport} onChange={setTransport} prefix="$" />
        <Field label="Monthly debt repayments" value={debt} onChange={setDebt} prefix="$" />
        <Field label="Monthly subscriptions" value={subscriptions} onChange={setSubscriptions} prefix="$" />
        <Field label="Other monthly spending" value={other} onChange={setOther} prefix="$" />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <ResultCard title="Required monthly saving" value={formatMoney(result.requiredMonthlySaving)} detail={`To hit ${formatMoney(goalAmount)} in ${Math.round(result.months * 10) / 10} months`} />
        <ResultCard title="Available after expenses" value={formatMoney(result.monthlyAvailable)} detail={`${formatMoney(result.monthlyIncome)} monthly income minus ${formatMoney(result.monthlyExpenses)} expenses`} />
        <ResultCard title="Status" value={result.status} detail={result.surplusAfterGoal >= 0 ? `${formatMoney(result.surplusAfterGoal)} spare after saving target` : `${formatMoney(Math.abs(result.surplusAfterGoal))} monthly gap`} />
      </div>

      <div className="mt-6 rounded-3xl border border-[#CBD5E1] bg-slate-50 p-5">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.15em] text-[#64748B]">Projection</p>
            <h3 className="mt-2 text-2xl font-black tracking-tight">
              You are projected to save {formatMoney(result.projectedSavings)}.
            </h3>
            <p className="mt-2 text-sm text-[#475569]">
              {result.shortfall > 0
                ? `You would be ${formatMoney(result.shortfall)} short unless income increases, expenses drop, or the timeframe is extended.`
                : `You are on track to reach your goal with the current inputs.`}
            </p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-sm text-[#64748B]">Goal coverage</p>
            <p className="text-3xl font-black">{Math.round(result.successRate)}%</p>
          </div>
        </div>
        <div className="mt-5 h-4 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-[#F97316]" style={{ width: `${result.successRate}%` }} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-[#CBD5E1] bg-white p-5">
          <h3 className="text-lg font-bold text-[#111827]">Biggest savings factors</h3>
          <div className="mt-4 space-y-3">
            {savingTips.slice(0, 4).map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-2xl bg-[#EFF6FF] px-4 py-3 text-sm">
                <span className="font-medium text-slate-700">{label}</span>
                <span className="font-bold">{formatMoney(clamp(value))}/mo</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-[#CBD5E1] bg-white p-5">
          <h3 className="text-lg font-bold text-[#111827]">What needs to change?</h3>
          <p className="mt-3 text-sm leading-6 text-[#475569]">
            {result.surplusAfterGoal >= 0
              ? `Your plan works. You can save ${formatMoney(result.requiredMonthlySaving)} per month and still have ${formatMoney(result.surplusAfterGoal)} left over.`
              : `You need to find ${formatMoney(Math.abs(result.surplusAfterGoal))} per month by cutting expenses, increasing income, reducing the goal, or extending the timeframe.`}
          </p>
        </div>
      </div>
    </ToolShell>
  );
}

const tools = [
  ["roster-salary", "Roster Salary"],
  ["after-tax", "After-Tax"],
  ["annual-income", "Income Predictor"],
  ["super", "Super"],
  ["overtime", "Overtime"],
  ["hourly-converter", "Hourly Converter"],
  ["savings-projection", "Savings Goal"],
];

const overviewCards = [
  [Icons.calendar, "Roster Salary Calculator", "Estimate salary from days on/off and day rate."],
  [Icons.shield, "After-Tax Estimator", "Estimate take-home pay from gross income."],
  [Icons.trend, "Annual Income Predictor", "Forecast yearly earnings with weeks and bonuses."],
  [Icons.dollar, "Super Calculator", "Estimate employer and extra super contributions."],
  [Icons.clock, "Overtime Estimator", "Calculate overtime based on hours and multipliers."],
  [Icons.calculator, "Hourly-to-Annual Converter", "Turn hourly rates into annual income."],
  [Icons.target, "Savings Goal Projection", "See exactly how much to save per month to hit a goal."],
];

export default function FIFOPayCalculatorMVP() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827]">
      <header className="sticky top-0 z-50 border-b border-[#CBD5E1] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <a href="#top" className="flex items-center gap-2 font-bold tracking-tight">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#111827] text-lg text-white shadow-lg">
              <Icons.hammer />
            </span>
            FIFO Money Tools
          </a>
          <nav className="hidden gap-5 text-sm font-medium text-[#475569] lg:flex">
            {tools.map(([href, label]) => (
              <a key={href} href={`#${href}`} className="hover:text-[#111827]">
                {label}
              </a>
            ))}
          </nav>
          <Button href="#roster-salary">Start calculating</Button>
        </div>
      </header>

      <main id="top">
        <section className="relative overflow-hidden bg-gradient-to-br from-[#111827] via-[#1E293B] to-[#111827] text-white">
          <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_30%_20%,white,transparent_30%),radial-gradient(circle_at_80%_10%,white,transparent_25%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-20 md:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="mb-5 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-slate-200">
                Built for FIFO workers, mining crews, shutdown workers, and high-income WA job seekers
              </div>
              <h1 className="max-w-3xl text-5xl font-black tracking-tight md:text-7xl">
                Calculate your FIFO pay before you take the job.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200 md:text-xl">
                Compare rosters, estimate take-home pay, forecast annual income, calculate super, and work out overtime from one simple dashboard.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button href="#roster-salary" variant="light">
                  Use the free tools <Icons.arrow className="ml-2 text-xl" />
                </Button>
                <Button href="#tools-overview" variant="outline">
                  See all calculators
                </Button>
              </div>
            </div>

            <div>
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur">
                <div className="rounded-[1.5rem] bg-white p-6 text-[#111827]">
                  <p className="text-sm font-semibold text-[#64748B]">Example result</p>
                  <p className="mt-2 text-4xl font-black text-[#F97316]">$103,200</p>
                  <p className="text-sm text-[#64748B]">estimated take-home on a $750/day 2:1 roster</p>
                  <div className="mt-6 space-y-3">
                    {["Annual gross: $182,500", "Tax estimate: $79,300", "Average weekly: $1,985"].map((item) => (
                      <div key={item} className="flex items-center gap-3 rounded-2xl bg-[#EFF6FF] p-4 text-sm font-medium">
                        <Icons.shield className="text-lg" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="tools-overview" className="mx-auto max-w-7xl px-5 py-14">
          <div className="mb-8 max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#F97316]">Free FIFO calculators</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">Seven simple tools for pay clarity.</h2>
            <p className="mt-4 text-[#475569]">
              Practical FIFO pay, tax, super, overtime, and savings calculators built to help you understand your money before you commit to a roster.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {overviewCards.map(([CardIcon, title, desc]) => (
              <div key={title} className="rounded-3xl border border-[#CBD5E1] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EFF6FF] text-xl">
                  <CardIcon />
                </div>
                <h3 className="text-lg font-bold text-[#111827]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#475569]">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mx-auto grid max-w-7xl gap-8 px-5 pb-20">
          <RosterSalaryCalculator />
          <AfterTaxEstimator />
          <AnnualIncomePredictor />
          <SuperCalculator />
          <OvertimeEstimator />
          <HourlyAnnualConverter />
          <SavingsProjectionCalculator />
        </div>

        <section className="bg-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 lg:grid-cols-3">
            <div className="rounded-3xl bg-[#111827] p-6 text-white lg:col-span-3">
              <p className="text-sm text-slate-200">Disclaimer</p>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                These calculators provide rough estimates only and are not financial, tax, or employment advice. Always check current ATO rules, your contract, and payslip details.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
