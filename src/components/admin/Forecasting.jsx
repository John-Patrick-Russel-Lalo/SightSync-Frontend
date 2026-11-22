import { useMemo, useState } from "react";
import { forecastDaily } from "../../utils/forecast.js";

const money = (value) => `₱${value.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const count = (value) => value.toLocaleString("en-PH", { maximumFractionDigits: 1 });

export default function Forecasting({ sales, appointments, archives, rangeDays, errors, loading }) {
  const [horizon, setHorizon] = useState(7);
  const forecasts = useMemo(() => {
    const options = { lookback: rangeDays === "all" ? 90 : Number(rangeDays), horizon };
    const validSales = sales.filter((sale) => !["voided", "refunded", "cancelled"].includes((sale.status || "completed").toLowerCase()));
    const seen = new Set();
    const history = [...archives, ...appointments].filter((appointment) => {
      const id = appointment.source_appointment_id ?? (archives.includes(appointment) ? null : appointment.id);
      if (id == null) return true;
      if (seen.has(String(id))) return false;
      seen.add(String(id));
      return true;
    });
    const salesUnavailable = errors.sales || sales.length >= 1000;
    return [
      { label: "Revenue", format: money, unavailable: salesUnavailable,
        result: salesUnavailable ? null : forecastDaily(validSales.map((sale) => ({ date: sale.created_at, value: sale.total })), options) },
      { label: "Sales count", format: count, unavailable: salesUnavailable,
        result: salesUnavailable ? null : forecastDaily(validSales.map((sale) => ({ date: sale.created_at, value: 1 })), options) },
      { label: "Appointment volume", format: count, unavailable: errors.appointments || errors.archive,
        result: errors.appointments || errors.archive ? null : forecastDaily(history.map((appointment) => ({ date: appointment.start_time || appointment.date, value: 1 })), options) },
    ];
  }, [sales, appointments, archives, rangeDays, horizon, errors]);

  return (
    <section className="space-y-5">
      <div className="bg-[#F8F3EC] border border-[#DCD0C0] rounded-2xl p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-stone-900">Forecasting</h3>
          <label className="text-sm text-stone-700">Forecast horizon
            <select value={horizon} onChange={(event) => setHorizon(Number(event.target.value))} className="ml-3 rounded-lg border border-[#DCD0C0] p-2 bg-[#F2EAE1]">
              {[7, 14, 30].map((days) => <option key={days} value={days}>Next {days} days</option>)}
            </select>
          </label>
        </div>
        <p className="text-sm text-stone-600">Projections begin tomorrow and use average activity for matching weekdays in the selected history window (up to 90 days for All Time). Today and future bookings are excluded from training. Days without activity count as zero.</p>
        <p className="text-xs text-stone-500">Estimates assume recent weekly patterns continue; holidays and future changes are not modeled. Counts are expected averages. At least 14 complete days since the first recorded activity are required; choose Last 30 Days or longer. Appointment volume includes all booking outcomes.</p>
      </div>
      {loading ? <p role="status" className="text-sm text-stone-500">Updating forecast data…</p> : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {forecasts.map(({ label, format, result, unavailable }) => (
            <article key={label} className="bg-[#F8F3EC] border border-[#DCD0C0] rounded-2xl p-5 space-y-4">
              <h4 className="font-bold text-stone-900">Projected {label.toLowerCase()}</h4>
              {!result ? <p className="text-sm text-stone-600">{unavailable ? "Forecast unavailable: history failed to load or the sales history limit was reached." : "Not enough history in this window. At least 14 complete days are required."}</p> : <>
                <p className="text-2xl font-extrabold text-[#8B1E42]">{format(result.total)}</p>
                <p className="text-xs text-stone-500">{result.points[0].date} → {result.points.at(-1).date}<br />Based on {result.days} days: {result.start} → {result.end}</p>
                <div className="max-h-72 overflow-auto">
                  <table className="w-full text-xs text-left">
                    <caption className="sr-only">Daily {label.toLowerCase()} forecast</caption>
                    <thead><tr><th className="py-2">Date</th><th className="py-2 text-right">Projected</th></tr></thead>
                    <tbody>{result.points.map((point) => <tr key={point.date} className="border-t border-[#E3D8CC]"><td className="py-2">{point.date}</td><td className="py-2 text-right font-semibold">{format(point.value)}</td></tr>)}</tbody>
                  </table>
                </div>
              </>}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
