import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function MonthCalendar({ scheduledDays = [], selected, onSelectDate }) {
  const [viewDate, setViewDate] = useState(
    new Date(selected.getFullYear(), selected.getMonth(), 1)
  );

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthLabel = viewDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const today = new Date();
  const isToday = (d) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  const isSelected = (d) =>
    d === selected.getDate() && month === selected.getMonth() && year === selected.getFullYear();

  const changeMonth = (delta) => {
    setViewDate(new Date(year, month + delta, 1));
  };

  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-[#F8F3EC] border border-[#DCCFBF] rounded-3xl p-6 w-full lg:w-[380px] shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs uppercase font-bold tracking-wider text-[#8B7562]">
            Schedule
          </div>
          <div className="text-lg font-bold text-[#3D2E28]">{monthLabel}</div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => changeMonth(-1)}
            className="p-1.5 rounded-full text-[#8B7562] hover:text-[#3D2E28] hover:bg-[#EDE3D8] transition"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => changeMonth(1)}
            className="p-1.5 rounded-full text-[#8B7562] hover:text-[#3D2E28] hover:bg-[#EDE3D8] transition"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 mb-2">
        {weekdayLabels.map((w, i) => (
          <div key={i} className="text-xs font-semibold text-[#8B7562] text-center">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((d, i) =>
          d === null ? (
            <div key={i} className="h-9 w-9" />
          ) : (
            <button
              key={i}
              onClick={() => onSelectDate(new Date(year, month, d))}
              className={`h-9 w-9 mx-auto flex flex-col items-center justify-center rounded-xl text-sm transition relative ${
                isSelected(d)
                  ? "bg-[#8B1E42] text-white font-bold shadow-sm"
                  : isToday(d)
                  ? "border border-[#8B1E42] text-[#8B1E42] font-bold"
                  : "text-[#3D2E28] hover:bg-[#EDE3D8]"
              }`}
            >
              <span>{d}</span>
              {scheduledDays.includes(d) && (
                <span
                  className={`w-1.5 h-1.5 rounded-full absolute bottom-1 ${
                    isSelected(d) ? "bg-white" : "bg-[#C08A3E]"
                  }`}
                />
              )}
            </button>
          )
        )}
      </div>

      <div className="mt-5 pt-3 border-t border-[#DCCFBF] flex items-center justify-between text-xs text-[#8B7562] font-medium">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#C08A3E]" />
          Has appointments
        </div>
        <div>
          {selected.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </div>
      </div>
    </div>
  );
}