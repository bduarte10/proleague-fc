import { TeamStats } from "@/app/utils";

export function StandingsTable({ stats }: { stats: TeamStats[] }) {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-slate-200 mb-6">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
          <tr>
            <th className="px-3 py-3 w-10">Pos</th>
            <th className="px-3 py-3">Time</th>
            <th className="px-3 py-3 text-center font-bold text-slate-900">
              P
            </th>
            <th className="px-3 py-3 text-center hidden md:table-cell">J</th>
            <th className="px-3 py-3 text-center hidden md:table-cell">V</th>
            <th className="px-3 py-3 text-center">SG</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((team, index) => (
            <tr
              key={team.teamId}
              className={`border-b last:border-0 ${
                index < 2 ? "bg-green-50/50" : ""
              }`}
            >
              <td className="px-3 py-2 font-medium text-slate-500">
                {index + 1}º
              </td>
              <td className="px-3 py-2 font-semibold text-slate-800 truncate max-w-[120px]">
                {team.teamName}
              </td>
              <td className="px-3 py-2 text-center font-bold text-slate-900">
                {team.points}
              </td>
              <td className="px-3 py-2 text-center hidden md:table-cell text-slate-500">
                {team.played}
              </td>
              <td className="px-3 py-2 text-center hidden md:table-cell text-slate-500">
                {team.wins}
              </td>
              <td className="px-3 py-2 text-center text-slate-500">
                {team.goalDifference > 0
                  ? `+${team.goalDifference}`
                  : team.goalDifference}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}





