import { Box, Paper, Typography } from "@mui/material";
import type { PumpAssemblyCalculateResponse } from "entities/pumpUnits/types/pumpAssemblyTypes";
import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const BORDER = "1px solid rgba(0, 0, 0, 0.12)";
const LINE_STROKE = "#d32f2f";

type Props = {
  result: PumpAssemblyCalculateResponse | null;
};

function num(v: number) {
  return v.toLocaleString("ru-RU", { maximumFractionDigits: 4 });
}

export default function PumpUnitsCharts({ result }: Props) {
  // Recharts freezes input data internally. Convert MobX observables to plain objects first.
  const points = useMemo(
    () => (result?.plotPoint ?? []).map((p) => ({ id: p.id, rate: p.rate, head: p.head, efficiency: p.efficiency })),
    [result]
  );

  return (
    <Paper
      elevation={0}
      sx={{
        border: BORDER,
        width: '100%',
        borderRadius: 1,
        bgcolor: "background.paper",
        p: 1,
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, px: 0.5 }}>
        <Typography variant="body2">Мощность: {result ? num(result.powerInput) : "—"}</Typography>
        <Typography variant="body2">Напор: {result ? num(result.head) : "—"}</Typography>
        <Typography variant="body2">КПД: {result ? num(result.efficiency) : "—"}</Typography>
      </Box>

      <Box sx={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 8, right: 14, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.12)" />
            <XAxis
              type="number"
              dataKey="rate"
              tick={{ fontSize: 11 }}
              label={{ value: "Расход, м3/ч", position: "bottom", offset: 0, fontSize: 12 }}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              label={{
                value: "Напор, м",
                angle: -90,
                position: "insideLeft",
                style: { textAnchor: "middle", fontSize: 12 },
              }}
            />
            <Tooltip
              formatter={(v) => [
                typeof v === "number" ? v.toLocaleString("ru-RU", { maximumFractionDigits: 4 }) : String(v),
                "",
              ]}
              labelFormatter={(l) => `Расход: ${Number(l).toLocaleString("ru-RU")} м3/ч`}
            />
            <Line
              type="monotone"
              dataKey="head"
              stroke={LINE_STROKE}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      <Box sx={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 8, right: 14, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.12)" />
            <XAxis
              type="number"
              dataKey="rate"
              tick={{ fontSize: 11 }}
              label={{ value: "Расход, м3/ч", position: "bottom", offset: 0, fontSize: 12 }}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              label={{
                value: "КПД, %",
                angle: -90,
                position: "insideLeft",
                style: { textAnchor: "middle", fontSize: 12 },
              }}
            />
            <Tooltip
              formatter={(v) => [
                typeof v === "number" ? v.toLocaleString("ru-RU", { maximumFractionDigits: 4 }) : String(v),
                "",
              ]}
              labelFormatter={(l) => `Расход: ${Number(l).toLocaleString("ru-RU")} м3/ч`}
            />
            <Line
              type="monotone"
              dataKey="efficiency"
              stroke={LINE_STROKE}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}
